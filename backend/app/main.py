# from fastapi import FastAPI, APIRouter
# from fastapi.middleware.cors import CORSMiddleware
#
# from app.routers import todo 
# from app.db.database import *
#
#
# Base.metadata.create_all(bind=engine)
#
#
# app = FastAPI()
#
# app.include_router(todo.router, prefix="/todos", tags=["Todos"])
#
# origins = [
#     "http://localhost:5500",
#     "http://127.0.0.1:5500",
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # временно
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
#
#
# @app.get("/")
# async def main():
#     return {"message": "Hello World"}
#
#
#
#
# # app.include_router(todo.router)

# # main.py
# from fastapi import FastAPI, WebSocket
# from db.db import SessionLocal
# from models.models import Message
#
# app = FastAPI()
#
# clients = []
#
# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     clients.append(websocket)
#
#     db = SessionLocal()
#
#     try:
#         while True:
#             data = await websocket.receive_text()
#
#             msg = Message(text=data, user="anon")
#             db.add(msg)
#             db.commit()
#
#             # отправляем всем клиентам
#             for client in clients:
#                 await client.send_text(f"anon: {data}")
#
#     except:
#         clients.remove(websocket)


# main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from db.db import SessionLocal
from models.models import Message

from routers.todo import router

app = FastAPI()

app.include_router(router)


clients = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    db = SessionLocal()
    clients.append(websocket)

    try:
        # 1. отправляем историю
        messages = db.execute(
            select(Message).order_by(Message.id)
        ).scalars().all()

        for msg in messages:
            await websocket.send_text(
                f"{msg.user}: {msg.text}"
            )

        # 2. принимаем новые сообщения
        while True:
            text = await websocket.receive_text()

            new_msg = Message(
                text=text,
                user="anon"
            )

            db.add(new_msg)
            db.commit()

            # рассылаем всем
            disconnected = []

            for client in clients:
                try:
                    await client.send_text(
                        f"anon: {text}"
                    )
                except:
                    disconnected.append(client)

            for d in disconnected:
                clients.remove(d)

    except WebSocketDisconnect:
        if websocket in clients:
            clients.remove(websocket)

    finally:
        db.close()
