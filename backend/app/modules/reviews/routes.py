from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from app.core.database import db
from app.modules.reviews.models import Survey, SurveyResponse, Question
from app.common.utils.dependencies import get_current_user

router = APIRouter(prefix="/surveys", tags=["surveys"])

# ================= ORGANIZER ENDPOINTS =================

@router.get("/organizer/{event_id}", response_model=Survey)
async def get_survey_setup(event_id: str, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    """Get the survey configuration for a specific event."""
    # Verify event ownership
    organizer_id = str(current_user["_id"])
    try:
        event_obj_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event_id")

    event = await db.events.find_one({
        "_id": event_obj_id,
        "$or": [
            {"organizer_id": organizer_id},
            {"organizer_id": current_user["_id"]},
        ]
    })
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
        
    survey = await db.surveys.find_one({"event_id": event_id})
    if not survey:
        # Return default empty survey structure if none exists yet
        return Survey(event_id=event_id, organizer_id=organizer_id, questions=[])
        
    survey["_id"] = str(survey["_id"])
    return survey

@router.put("/organizer/{event_id}")
async def save_survey_setup(event_id: str, payload: dict, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    """Create or update the survey questions for an event."""
    # Verify event ownership
    organizer_id = str(current_user["_id"])
    try:
        event_obj_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event_id")

    event = await db.events.find_one({
        "_id": event_obj_id,
        "$or": [
            {"organizer_id": organizer_id},
            {"organizer_id": current_user["_id"]},
        ]
    })
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
        
    questions = payload.get("questions", [])
    
    # Upsert the survey record
    result = await db.surveys.update_one(
        {"event_id": event_id},
        {
            "$set": {
                "questions": questions,
                "organizer_id": organizer_id,
                "updated_at": __import__('datetime').datetime.utcnow()
            },
            "$setOnInsert": {
                "created_at": __import__('datetime').datetime.utcnow(),
                "is_active": True
            }
        },
        upsert=True
    )
    
    return {"message": "Survey saved successfully"}

@router.get("/organizer/{event_id}/responses")
async def get_survey_responses(event_id: str, current_user=Depends(get_current_user(required_role="ORGANIZER"))):
    """Get all submitted responses for an event's survey."""
    # Verify event ownership
    organizer_id = str(current_user["_id"])
    try:
        event_obj_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event_id")

    event = await db.events.find_one({
        "_id": event_obj_id,
        "$or": [
            {"organizer_id": organizer_id},
            {"organizer_id": current_user["_id"]},
        ]
    })
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
        
    cursor = db.survey_responses.find({"event_id": event_id}).sort("submitted_at", -1)
    responses = await cursor.to_list(length=1000)
    
    for r in responses:
        r["_id"] = str(r["_id"])
    
    return responses

# ================= USER ENDPOINTS =================

@router.get("/event/{event_id}", response_model=Survey)
async def get_event_survey(event_id: str, current_user=Depends(get_current_user(required_role="USER"))):
    """Fetch the survey questions for users to answer."""
    survey = await db.surveys.find_one({"event_id": event_id, "is_active": True})
    if not survey:
        survey = await db.surveys.find_one({"event_id": event_id, "is_active": {"$exists": False}})
        if survey:
            await db.surveys.update_one({"_id": survey["_id"]}, {"$set": {"is_active": True}})
            survey["is_active"] = True
        else:
            raise HTTPException(status_code=404, detail="No active survey found for this event")
        
    survey["_id"] = str(survey["_id"])
    return survey

@router.get("/event/{event_id}/my-response")
async def check_my_response(event_id: str, current_user=Depends(get_current_user(required_role="USER"))):
    """Check if the current logged-in user has already submitted a response."""
    respondent_id = str(current_user["_id"])
    existing = await db.survey_responses.find_one({
        "event_id": event_id,
        "respondent_id": respondent_id
    })
    
    if existing:
        existing["_id"] = str(existing["_id"])
        return {"has_responded": True, "response": existing}
        
    return {"has_responded": False}

@router.post("/event/{event_id}/respond")
async def submit_survey_response(event_id: str, payload: dict, current_user=Depends(get_current_user(required_role="USER"))):
    """Submit a survey response."""
    survey = await db.surveys.find_one({"event_id": event_id, "is_active": True})
    if not survey:
        raise HTTPException(status_code=404, detail="No active survey found for this event")
        
    # Prevent duplicate submissions
    respondent_id = str(current_user["_id"])
    existing = await db.survey_responses.find_one({
        "event_id": event_id,
        "respondent_id": respondent_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted feedback for this event")

    answers = payload.get("responses", [])
    
    response_doc = SurveyResponse(
        survey_id=str(survey["_id"]),
        event_id=event_id,
        respondent_id=respondent_id,
        respondent_name=current_user.get("full_name", current_user.get("username", "Anonymous")),
        responses=answers
    )
    
    await db.survey_responses.insert_one(response_doc.dict(by_alias=True, exclude_none=True))
    
    return {"message": "Thank you! Your feedback has been submitted."}
