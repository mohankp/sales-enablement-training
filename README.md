# Sales Training Simulator

A comprehensive sales training platform that uses AI to generate assessments from PDF training materials. It features a proficiency-based progression system (Beginner -> Intermediate -> Advanced) and a Vue.js web console for management.

## Features

-   **PDF Ingestion**: Upload sales training documents (PDF) to build a vector knowledge base.
-   **AI-Powered Assessment**: Automatically generates multiple-choice questions based on the ingested content using Gemini 1.5 Pro.
-   **Adaptive Learning**: Tracks user proficiency per topic and overall, adjusting difficulty levels dynamically.
-   **Web Console**: A modern Vue.js dashboard to manage uploads, view processing status, and inspect the knowledge base.
-   **Knowledge Base Inspection**: Search and debug the underlying vector index.

## Tech Stack

-   **Backend**: Python, FastAPI, SQLAlchemy, SQLite
-   **AI/LLM**: LlamaIndex, Gemini 1.5 Pro, ChromaDB (Vector Store)
-   **Frontend**: Vue.js 3, Pinia, Vue Router
-   **Authentication**: JWT (JSON Web Tokens) with Argon2 password hashing

## Setup

### Prerequisites

-   Python 3.10+
-   Node.js 16+
-   Google Gemini API Key

### Backend Setup

1.  **Create a Virtual Environment**:
    ```bash
    python3 -m venv .
    source bin/activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Seed Default User**:
    Initialize the database and create a default admin user (`admin` / `admin`).
    ```bash
    python seed_data.py
    ```

5.  **Run the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`. API Docs at `/docs`.

### Frontend Setup

1.  **Navigate to Web Console**:
    ```bash
    cd web-console
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the console at `http://localhost:5173`.

## Usage

1.  **Login**: Use the default credentials `admin` / `admin`.
2.  **Upload**: Go to the Dashboard and upload a Sales Training PDF.
3.  **Wait**: The file will be processed in the background. Check the status in the "Processing Jobs" list.
4.  **Inspect**: Use the "Knowledge Base" tab to verify the content was indexed correctly.
5.  **Train**: (Client functionality coming soon) Use the API to start an assessment session.

## API Endpoints

-   `POST /api/v1/auth/token`: Login
-   `POST /api/v1/upload_pdf`: Upload PDF for ingestion
-   `POST /api/v1/start_assessment`: Start a new training session
-   `GET /api/v1/get_question/{session_id}`: Get the next question
-   `POST /api/v1/submit_answer`: Submit answer and get feedback
-   `GET /api/v1/admin/jobs`: View processing job status
