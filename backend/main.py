from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
import os
from dotenv import load_dotenv
from rabbitmq_config import publish_message
from mongodb_config import create_user, verify_user

load_dotenv()

app = FastAPI(title="Sistema de Mensagens Futuras")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
class Message(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    text: str
    recipient_id: str
    event_date: datetime
    reminder_days: int
    want_reminder: bool

# Rotas
@app.post("/login")
async def login(phone: str = Form(...), password: str = Form(...)):
    user = verify_user(phone, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {
        "access_token": "fake_token",
        "token_type": "bearer",
        "user": {
            "first_name": user["first_name"],
            "phone": user["phone"]
        }
    }

@app.post("/register")
async def register(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...)
):
    try:
        user_data = {
            "first_name": first_name,
            "last_name": last_name,
            "phone": phone,
            "password": password
        }
        result = create_user(user_data)
        return {"message": "Usuário criado com sucesso", "id": str(result.inserted_id)}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

@app.post("/messages")
async def create_message(message: Message):
    try:
        # Publica a mensagem no RabbitMQ
        publish_message(message.model_dump())
        return {"message": "Mensagem recebida com sucesso"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar mensagem: {str(e)}"
        )

@app.get("/")
async def root():
    return {"message": "API de Mensagens Futuras"} 