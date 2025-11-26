import json
import random
from sqlalchemy.orm import Session
from app.models import AssessmentSession, QuestionHistory, Topic, User, TopicScore
from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb
from app.config import settings
from llama_index.core import Settings as LlamaSettings

# Re-initialize Chroma (should be a singleton in real app)
db_client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
chroma_collection = db_client.get_or_create_collection("sales_knowledge_base")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter

def start_new_session(db: Session, user_id: int, project_id: int = None, topic_id: int = None):
    # Check if user exists, if not create (simple logic for now)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, username=f"user_{user_id}")
        db.add(user)
        db.commit()

    session = AssessmentSession(
        user_id=user_id, 
        current_level="Beginner", 
        score=0.0,
        project_id=project_id,
        topic_id=topic_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def generate_question(db: Session, session_id: int):
    session = db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    if not session:
        return None
    
    # Logic to pick a topic
    if session.topic_id:
        topic = db.query(Topic).filter(Topic.id == session.topic_id).first()
        if not topic:
            return {"error": "Specified topic not found."}
    else:
        # Pick random topic from project or all
        query = db.query(Topic)
        if session.project_id:
            query = query.filter(Topic.project_id == session.project_id)
        topics = query.all()
        
        if not topics:
            return {"error": "No topics found. Please ingest a PDF first."}
        topic = random.choice(topics)

    # Generate Question using LLM with strict JSON format
    # Filter retrieval by project_id if applicable
    
    # NEW LOGIC: Try to get from QuestionBank first
    from app.models import QuestionBank, QuestionHistory
    import json

    # Get IDs of questions already answered in this session
    answered_ids = db.query(QuestionHistory.question_text).filter(QuestionHistory.session_id == session_id).all()
    # Note: QuestionHistory stores text, not ID currently. 
    # Ideally we should link to QuestionBank ID, but for now we filter by text or just random pick and hope?
    # Let's try to filter by text if possible, or just pick random and check.
    answered_texts = [a[0] for a in answered_ids]

    # Query QuestionBank
    q_query = db.query(QuestionBank).filter(
        QuestionBank.topic_id == topic.id,
        QuestionBank.difficulty == session.current_level
    )
    if answered_texts:
        q_query = q_query.filter(QuestionBank.question_text.notin_(answered_texts))
    
    available_questions = q_query.all()
    
    if available_questions:
        # Pick one
        q = random.choice(available_questions)
        
        # Store question in history (pending answer)
        history = QuestionHistory(
            session_id=session.id,
            topic_id=topic.id,
            question_text=q.question_text,
            correct_answer=q.correct_answer,
            is_correct=0 # Default
        )
        db.add(history)
        db.commit()

        return {
            "session_id": session.id,
            "level": session.current_level,
            "topic": topic.name,
            "question": q.question_text,
            "options": json.loads(q.choices)
        }
    
    # Fallback to dynamic generation if no pre-generated questions found
    filters = None
    if session.project_id:
        filters = MetadataFilters(
            filters=[ExactMatchFilter(key="project_id", value=str(session.project_id))]
        )

    query_engine = index.as_query_engine(filters=filters)
    prompt = (
        f"Generate a {session.current_level} level multiple-choice question about '{topic.name}'. "
        "The output must be a valid JSON object with the following keys: "
        "'question_text', 'choices' (list of 4 strings), 'correct_answer' (string, must match one choice exactly). "
        "Do not include markdown formatting like ```json."
    )
    
    response = query_engine.query(prompt)
    
    # Parse JSON
    try:
        json_str = str(response).strip()
        # Remove markdown code blocks if present
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
            
        question_data = json.loads(json_str)

        # Store question in history (pending answer)
        history = QuestionHistory(
            session_id=session.id,
            topic_id=topic.id,
            question_text=question_data['question_text'],
            correct_answer=question_data['correct_answer'],
            is_correct=0 # Default
        )
        db.add(history)
        db.commit()
        
        return {
            "session_id": session.id,
            "level": session.current_level,
            "topic": topic.name,
            "question": question_data['question_text'],
            "options": question_data['choices']
        }
    except json.JSONDecodeError:
        return {"error": "Failed to generate valid JSON question", "raw_response": str(response)}

def submit_answer(db: Session, session_id: int, user_answer: str, question_text: str):
    session = db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
    if not session:
        return {"error": "Session not found"}
        
    # Find the last question for this session matching the text
    # In a real app, we'd pass the question_id, but for now we match text
    history = db.query(QuestionHistory).filter(
        QuestionHistory.session_id == session.id,
        QuestionHistory.question_text == question_text
    ).order_by(QuestionHistory.id.desc()).first()
    
    if not history:
        return {"error": "Question not found in history"}
    
    history.user_answer = user_answer
    
    # Evaluate
    def normalize_answer(text):
        import re
        # Remove all whitespace and convert to lower case
        # Also remove common punctuation like . , -
        text = str(text).lower()
        text = re.sub(r'\s+', '', text) # Remove all whitespace
        text = re.sub(r'[.,-]', '', text) # Remove punctuation
        return text

    is_correct = (normalize_answer(user_answer) == normalize_answer(history.correct_answer))
    
    # Fallback to LLM evaluation if strict match fails
    if not is_correct and settings.ENABLE_LLM_EVALUATION:
        try:
            eval_query_engine = index.as_query_engine()
            eval_prompt = (
                f"The correct answer to the question '{question_text}' is '{history.correct_answer}'. "
                f"The user answered '{user_answer}'. "
                "Does the user's answer mean the same thing as the correct answer? "
                "Ignore minor typos, formatting differences, or extra words if the core meaning is identical. "
                "Return ONLY 'YES' or 'NO'."
            )
            eval_response = eval_query_engine.query(eval_prompt)
            if str(eval_response).strip().upper() == "YES":
                is_correct = True
        except Exception as e:
            print(f"LLM evaluation failed: {e}")
            # Fallback to False if LLM fails

    history.is_correct = 1 if is_correct else 0
    
    feedback = "Correct!"
    if not is_correct:
        # Generate explanation using LLM
        query_engine = index.as_query_engine()
        prompt = (
            f"The user answered '{user_answer}' to the question '{question_text}'. "
            f"The correct answer is '{history.correct_answer}'. "
            "Provide a brief explanation of why the answer is incorrect and explain the correct concept."
        )
        response = query_engine.query(prompt)
        feedback = str(response)
    
    history.feedback = feedback
    
    # Update Score and Level
    # Simple logic: +10 for correct. If score > 50, move to Intermediate. If > 100, Advanced.
    if is_correct:
        session.score += 10
        
        # Update Topic Score
        topic_score = db.query(TopicScore).filter(
            TopicScore.user_id == session.user_id,
            TopicScore.topic_id == history.topic_id
        ).first()
        
        if not topic_score:
            topic_score = TopicScore(user_id=session.user_id, topic_id=history.topic_id, score=0.0)
            db.add(topic_score)
            
        topic_score.score += 10
        
        # Update Topic Proficiency
        if topic_score.score >= 30:
            topic_score.proficiency_level = "Intermediate"
        if topic_score.score >= 60:
            topic_score.proficiency_level = "Advanced"
            
    # Update Session Level based on overall score (simplified)
    if session.score >= 50 and session.current_level == "Beginner":
        session.current_level = "Intermediate"
    elif session.score >= 100 and session.current_level == "Intermediate":
        session.current_level = "Advanced"
        
    db.commit()
    
    return {
        "correct": is_correct,
        "feedback": feedback,
        "current_score": session.score,
        "current_level": session.current_level,
        "topic_score": topic_score.score if is_correct else 0 # Return current topic score
    }
