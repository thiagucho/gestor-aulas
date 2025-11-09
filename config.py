import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "clave-secreta-super-random"
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
