from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do MongoDB
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/mensagens_futuras")
print(f"Connecting to MongoDB with URI: {mongodb_uri}")

try:
    client = MongoClient(
        mongodb_uri,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
        retryWrites=True,
        w="majority"
    )
    # Test the connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
    print("Tentando reconectar sem autenticação...")
    try:
        client = MongoClient(
            "mongodb://localhost:27017/mensagens_futuras",
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            retryWrites=True,
            w="majority"
        )
        client.admin.command('ping')
        print("Successfully connected to MongoDB without authentication")
    except Exception as e:
        print(f"Failed to connect to MongoDB without authentication: {str(e)}")
        raise

try:
    db = client["mensagens_futuras"]
    # Create collections if they don't exist
    if "users" not in db.list_collection_names():
        db.create_collection("users")
    if "messages" not in db.list_collection_names():
        db.create_collection("messages")
    
    messages_collection = db["messages"]
    users_collection = db["users"]
    print("Collections created/verified successfully")
except Exception as e:
    print(f"Error setting up database collections: {str(e)}")
    raise

def get_database():
    return db 