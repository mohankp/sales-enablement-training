import pytest
from unittest.mock import patch, MagicMock

def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Sales Training Simulator API"}

@patch("app.ingestion.SimpleDirectoryReader")
@patch("app.ingestion.VectorStoreIndex")
@patch("app.ingestion.SessionLocal") # Mock the DB session used inside ingestion
def test_upload_pdf(mock_db_session, mock_index, mock_reader, client):
    # Mock the PDF processing
    mock_reader.return_value.load_data.return_value = []
    
    # Mock Query Engine for Topic Extraction
    mock_query_engine = MagicMock()
    mock_query_engine.query.return_value = "Sales, Marketing, Negotiation, Closing, Product Knowledge"
    mock_index.from_documents.return_value.as_query_engine.return_value = mock_query_engine
    
    # Mock DB for ingestion
    mock_db_instance = MagicMock()
    mock_db_session.return_value = mock_db_instance
    mock_db_instance.query.return_value.filter.return_value.first.return_value = None # No existing topic

    files = {"file": ("test.pdf", b"dummy content", "application/pdf")}
    response = client.post("/api/v1/upload_pdf", files=files)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "Sales" in response.json()["topics"]

@patch("app.assessment.index")
def test_assessment_flow(mock_index, client, db_session):
    # 1. Start Session
    response = client.post("/api/v1/start_assessment", json={"user_id": 1})
    assert response.status_code == 200
    session_data = response.json()
    assert session_data["current_level"] == "Beginner"
    session_id = session_data["id"]

    # 2. Create a dummy Topic manually since we mocked ingestion
    from app.models import Topic
    topic = Topic(name="Sales", description="Test Topic")
    db_session.add(topic)
    db_session.commit()

    # 3. Get Question
    # Mock LLM response for question generation
    mock_query_engine = MagicMock()
    mock_query_engine.query.return_value = '{"question": "What is sales?", "options": ["A", "B", "C", "D"], "correct_answer": "A"}'
    mock_index.as_query_engine.return_value = mock_query_engine

    response = client.get(f"/api/v1/get_question/{session_id}")
    assert response.status_code == 200
    question_data = response.json()
    assert question_data["question"] == "What is sales?"
    assert question_data["topic"] == "Sales"

    # 4. Submit Answer (Correct)
    # Mock LLM response for feedback (though not needed for correct answer in our logic)
    mock_query_engine.query.return_value = "Correct explanation."
    
    response = client.post("/api/v1/submit_answer", json={
        "session_id": session_id,
        "question_text": "What is sales?",
        "user_answer": "A"
    })
    assert response.status_code == 200
    result = response.json()
    assert result["correct"] == True
    assert result["current_score"] == 10

    # 5. Submit Answer (Incorrect)
    # Mock LLM response for feedback
    mock_query_engine.query.return_value = "Actually, A is correct because..."
    
    # We need to generate another question first to have history, 
    # but for simplicity let's just reuse the previous one if the logic allows, 
    # or just verify the score didn't increase. 
    # Actually, our logic looks up by question text in history.
    
    response = client.post("/api/v1/submit_answer", json={
        "session_id": session_id,
        "question_text": "What is sales?",
        "user_answer": "B"
    })
    assert response.status_code == 200
    result = response.json()
    assert result["correct"] == False
    assert result["feedback"] == "Actually, A is correct because..."
