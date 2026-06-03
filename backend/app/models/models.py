# models.py
from db.db import Base
from sqlalchemy import Column, Integer, String

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    user = Column(String)
