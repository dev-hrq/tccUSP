from pymongo import MongoClient
from passlib.context import CryptContext
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

# Configuração de criptografia
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(user_data):
    try:
        # Verifica se o usuário já existe
        if users_collection.find_one({"phone": user_data["phone"]}):
            raise ValueError("Usuário já existe com este número de telefone")
        
        # Criptografa a senha
        hashed_password = pwd_context.hash(user_data["password"])
        user_data["password"] = hashed_password
        
        # Insere o usuário no banco de dados
        result = users_collection.insert_one(user_data)
        print(f"User created successfully with ID: {result.inserted_id}")
        return result
    except ValueError as e:
        print(f"Validation error creating user: {str(e)}")
        raise
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        raise

def verify_user(phone, password):
    try:
        user = users_collection.find_one({"phone": phone})
        if not user:
            print(f"No user found with phone: {phone}")
            return None
        
        if not pwd_context.verify(password, user["password"]):
            print(f"Invalid password for user: {phone}")
            return None
        
        return user
    except Exception as e:
        print(f"Error verifying user: {str(e)}")
        return None

def save_message(message_data):
    try:
        return messages_collection.insert_one(message_data)
    except Exception as e:
        print(f"Error saving message: {str(e)}")
        raise

def get_messages_by_recipient(recipient_id):
    try:
        return list(messages_collection.find({"recipient_id": recipient_id}))
    except Exception as e:
        print(f"Error getting messages: {str(e)}")
        return [] 