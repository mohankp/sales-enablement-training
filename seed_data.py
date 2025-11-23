from app.database import SessionLocal, engine
from app.models import Base, User
from passlib.context import CryptContext

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_admin():
    db = SessionLocal()
    try:
        username = "admin"
        password = "admin"
        
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"User '{username}' already exists.")
            return

        hashed_password = get_password_hash(password)
        user = User(username=username, password_hash=hashed_password)
        db.add(user)
        db.commit()
        print(f"Created user '{username}' with password '{password}'")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
