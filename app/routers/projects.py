from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, Topic
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class TopicSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    
    class Config:
        orm_mode = True

@router.post("/", response_model=ProjectSchema)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.name == project.name).first()
    if db_project:
        raise HTTPException(status_code=400, detail="Project already exists")
    new_project = Project(name=project.name, description=project.description)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/", response_model=List[ProjectSchema])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/{project_id}/topics", response_model=List[TopicSchema])
def list_project_topics(project_id: int, db: Session = Depends(get_db)):
    return db.query(Topic).filter(Topic.project_id == project_id).all()
