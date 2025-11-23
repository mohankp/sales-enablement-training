import sys
try:
    from llama_index.vector_stores.chroma import ChromaVectorStore
    print("Successfully imported ChromaVectorStore")
except ImportError as e:
    print(f"Failed to import ChromaVectorStore: {e}")
    sys.exit(1)

try:
    from app.main import app
    print("Successfully imported app")
except ImportError as e:
    print(f"Failed to import app: {e}")
    sys.exit(1)
