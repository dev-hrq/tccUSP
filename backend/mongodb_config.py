from pymongo import MongoClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do MongoDB
client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
db = client["mensagens_futuras"]
messages_collection = db["messages"]
users_collection = db["users"]

# Configuração de criptografia
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(user_data):
    # Verifica se o usuário já existe
    if users_collection.find_one({"phone": user_data["phone"]}):
        raise ValueError("Usuário já existe com este número de telefone")
    
    # Criptografa a senha
    hashed_password = pwd_context.hash(user_data["password"])
    user_data["password"] = hashed_password
    
    # Insere o usuário no banco de dados
    result = users_collection.insert_one(user_data)
    return result

def verify_user(phone, password):
    user = users_collection.find_one({"phone": phone})
    if not user:
        return None
    
    if not pwd_context.verify(password, user["password"]):
        return None
    
    return user

def save_message(message_data):
    return messages_collection.insert_one(message_data)

def get_messages_by_recipient(recipient_id):
    return list(messages_collection.find({"recipient_id": recipient_id})) 