from pymongo import MongoClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do MongoDB
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
print(f"Connecting to MongoDB with URI: {mongodb_uri}")

try:
    client = MongoClient(
        mongodb_uri,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000
    )
    # Test the connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
    raise

db = client["mensagens_futuras"]
messages_collection = db["messages"]
users_collection = db["users"]

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
        return result
    except Exception as e:
        print(f"Erro ao criar usuário: {str(e)}")
        raise

def verify_user(phone, password):
    try:
        user = users_collection.find_one({"phone": phone})
        if not user:
            return None
        
        if not pwd_context.verify(password, user["password"]):
            return None
        
        return user
    except Exception as e:
        print(f"Erro ao verificar usuário: {str(e)}")
        return None

def save_message(message_data):
    try:
        return messages_collection.insert_one(message_data)
    except Exception as e:
        print(f"Erro ao salvar mensagem: {str(e)}")
        raise

def get_messages_by_recipient(recipient_id):
    try:
        return list(messages_collection.find({"recipient_id": recipient_id}))
    except Exception as e:
        print(f"Erro ao buscar mensagens: {str(e)}")
        return [] 