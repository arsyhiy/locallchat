from fastapi import APIRouter

router = APIRouter(prefix="/api")

@router.get("/message")
async def send_message():
    return