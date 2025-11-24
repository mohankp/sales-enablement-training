import os
import shutil
from typing import List
from fastapi import UploadFile, File, HTTPException
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, Document
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.core import Settings as LlamaSettings
import chromadb
from app.config import settings
from app.database import SessionLocal
from app.models import Topic

# Initialize Gemini
LlamaSettings.llm = Gemini(api_key=settings.GEMINI_API_KEY, model_name="gemini-2.5-pro")
LlamaSettings.embed_model = GeminiEmbedding(api_key=settings.GEMINI_API_KEY, model_name="models/embedding-001")

# Initialize ChromaDB
db_client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
chroma_collection = db_client.get_or_create_collection("sales_knowledge_base")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

import asyncio
from fastapi import BackgroundTasks
from app.models import ProcessingJob

async def process_pdf_background(file_path: str, filename: str, job_id: int, context: str = None, project_id: int = None):
    db = SessionLocal()
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    job.status = "Processing"
    db.commit()
    
    try:
        # Load data
        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
        
        # Add metadata to documents
        for doc in documents:
            doc.metadata["filename"] = filename
            if context:
                doc.metadata["context"] = context
            if project_id:
                doc.metadata["project_id"] = str(project_id)

        # Create Index (This chunks and embeds automatically)
        index = VectorStoreIndex.from_documents(
            documents, storage_context=storage_context
        )
        
        # Extract and Save Topics to SQLite
        summary_query = (
            "Analyze the document and extract a comprehensive list of all distinct sales training topics covered. "
            "Return ONLY a comma-separated list of topic names. Do not include descriptions or numbering."
        )
        if context:
            summary_query += f" Focus specifically on: {context}"
            
        query_engine = index.as_query_engine()
        response = query_engine.query(summary_query)
        
        topics_list = [t.strip() for t in str(response).split(",") if t.strip()]
        
        topics_list = [t.strip() for t in str(response).split(",") if t.strip()]
        
        from app.models import QuestionBank
        import json

        for topic_name in topics_list:
            # Check if exists in this project
            existing = db.query(Topic).filter(Topic.name == topic_name, Topic.project_id == project_id).first()
            if not existing:
                new_topic = Topic(name=topic_name, description=f"Extracted from {filename}", project_id=project_id)
                db.add(new_topic)
                db.commit()
                db.refresh(new_topic)
                topic_id = new_topic.id
            else:
                topic_id = existing.id

            # Generate Questions for this topic (3 per level)
            levels = ["Beginner", "Intermediate", "Advanced"]
            for level in levels:
                # Check if we already have questions for this topic/level to avoid re-generating on re-process
                # (Optional optimization, skipping for now to ensure we get fresh ones if requested)
                
                q_prompt = (
                    f"Generate 3 {level} level multiple-choice questions about '{topic_name}' based on the document context. "
                    "Return a JSON array of objects. Each object must have: "
                    "'question_text', 'choices' (list of 4 strings), 'correct_answer' (string, must match one choice exactly). "
                    "Do not include markdown formatting like ```json."
                )
                
                # We can use the index to query specifically for this topic to get better context
                # But for now, general query engine is fine, maybe add topic focus
                q_query_engine = index.as_query_engine()
                q_response = q_query_engine.query(q_prompt)
                
                try:
                    # Clean response
                    json_str = str(q_response).strip()
                    if json_str.startswith("```json"):
                        json_str = json_str[7:]
                    if json_str.endswith("```"):
                        json_str = json_str[:-3]
                    
                    questions_data = json.loads(json_str)
                    
                    for q_data in questions_data:
                        new_q = QuestionBank(
                            topic_id=topic_id,
                            question_text=q_data['question_text'],
                            choices=json.dumps(q_data['choices']),
                            correct_answer=q_data['correct_answer'],
                            difficulty=level
                        )
                        db.add(new_q)
                    db.commit()
                except Exception as e:
                    print(f"Failed to generate/parse questions for {topic_name} ({level}): {e}")
                    # Continue to next level/topic
                    continue

        job.status = "Completed"
        job.message = f"Extracted {len(topics_list)} topics and generated questions."
        if context:
            job.message += f" (Context: {context})"
        db.commit()
        
    except Exception as e:
        job.status = "Failed"
        job.message = str(e)
        db.commit()
    finally:
        db.close()
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)

async def process_pdf_document(file: UploadFile, background_tasks: BackgroundTasks, context: str = None, project_id: int = None):
    # Save temp file
    temp_dir = "temp_ingest"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create Job
    db = SessionLocal()
    job = ProcessingJob(filename=file.filename, status="Pending", project_id=project_id)
    if context:
        job.message = f"Queued with context: {context}"
    db.add(job)
    db.commit()
    db.refresh(job)
    db.close()
    
    background_tasks.add_task(process_pdf_background, file_path, file.filename, job.id, context, project_id)
    
    return {"status": "queued", "job_id": job.id}
