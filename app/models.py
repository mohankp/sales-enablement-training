from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("AssessmentSession", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    topics = relationship("Topic", back_populates="project")
    jobs = relationship("ProcessingJob", back_populates="project")
    sessions = relationship("AssessmentSession", back_populates="project")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True) # Nullable for backward compatibility/default
    filename = Column(String)
    status = Column(String, default="Pending") # Pending, Processing, Completed, Failed
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="jobs")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    name = Column(String, index=True) # Removed unique constraint globally, should be unique per project ideally
    description = Column(Text)

    project = relationship("Project", back_populates="topics")

class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True) # For topic-specific assessment
    current_level = Column(String, default="Beginner") # Beginner, Intermediate, Advanced
    score = Column(Float, default=0.0)
    start_time = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="sessions")
    project = relationship("Project", back_populates="sessions")
    topic = relationship("Topic")
    history = relationship("QuestionHistory", back_populates="session")

class QuestionHistory(Base):
    __tablename__ = "question_history"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("assessment_sessions.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    question_text = Column(Text)
    user_answer = Column(Text)
    correct_answer = Column(Text)
    is_correct = Column(Integer) # 0 or 1
    feedback = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("AssessmentSession", back_populates="history")

class TopicScore(Base):
    __tablename__ = "topic_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    score = Column(Float, default=0.0)
    proficiency_level = Column(String, default="Beginner") # Beginner, Intermediate, Advanced
    
    user = relationship("User")
    topic = relationship("Topic")
