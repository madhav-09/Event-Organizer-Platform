from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum

class QuestionType(str, Enum):
    TEXT = "TEXT"
    RATING = "RATING"
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"

class Question(BaseModel):
    id: str  # e.g., "q1", "q_timestamp"
    text: str
    type: QuestionType
    options: List[str] = []

class Survey(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    event_id: str
    organizer_id: str
    questions: List[Question] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResponseAnswer(BaseModel):
    questionId: str
    answer: Union[str, int, float]

class SurveyResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    survey_id: str
    event_id: str
    respondent_id: str
    respondent_name: str
    responses: List[ResponseAnswer]
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
