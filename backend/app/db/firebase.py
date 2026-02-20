import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings
import os

db = None

def init_firebase():
    global db
    if not firebase_admin._apps:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print(f"✅ Firebase initialized with credentials from {cred_path}")
        else:
            print(f"⚠️ Firebase credentials not found at {cred_path}. Firebase functionality will be disabled.")
    else:
        db = firestore.client()

def get_firebase_db():
    if db is None:
        init_firebase()
    return db
