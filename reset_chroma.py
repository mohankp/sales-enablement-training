import chromadb
from app.config import settings
import shutil
import os

def reset_chroma():
    print(f"Connecting to ChromaDB at {settings.CHROMA_DB_DIR}...")
    
    # Option 1: Delete the collection using the client
    try:
        client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
        collection_name = "sales_knowledge_base"
        try:
            client.delete_collection(collection_name)
            print(f"Collection '{collection_name}' deleted successfully.")
        except ValueError:
            print(f"Collection '{collection_name}' does not exist.")
            
    except Exception as e:
        print(f"Error using ChromaDB client: {e}")
        print("Attempting hard reset by deleting directory...")
        
        # Option 2: Hard reset if client fails or for deep clean
        if os.path.exists(settings.CHROMA_DB_DIR):
            shutil.rmtree(settings.CHROMA_DB_DIR)
            print(f"Deleted directory: {settings.CHROMA_DB_DIR}")
        else:
            print(f"Directory {settings.CHROMA_DB_DIR} does not exist.")

if __name__ == "__main__":
    confirm = input("Are you sure you want to reset the ChromaDB knowledge base? This cannot be undone. (y/n): ")
    if confirm.lower() == 'y':
        reset_chroma()
        print("Reset complete.")
    else:
        print("Operation cancelled.")
