from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

router = APIRouter()

origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # временно
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.get("/message")
async def send_message():
    return {"message": "Hello World"}

@app.get("/")
async def main():
    return {"message": "Hello World"}




app.include_router(router)
