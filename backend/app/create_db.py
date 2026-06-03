# create_db.py
from db.db import Base, engine
from models.models import Message

Base.metadata.create_all(bind=engine)
