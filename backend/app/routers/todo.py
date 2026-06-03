from fastapi import FastAPI, APIRouter

router = APIRouter()

@router.get("/message")
async def send_message():
    return {"message": "Hello World"}
