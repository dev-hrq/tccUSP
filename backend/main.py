import logging
from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, ConfigDict
import os
from dotenv import load_dotenv
from rabbitmq_config import publish_message
from mongodb_config import create_user, verify_user
from app.models.message import Message
from app.routes import auth, messages
from app.core.security import create_access_token

load_dotenv()

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Isso fará os logs aparecerem no terminal
    ]
)

app = FastAPI(title="Sistema de Mensagens Futuras")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # Gerar um token de acesso válido
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
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

# Incluir as rotas de mensagens
app.include_router(messages.router, prefix="/api", tags=["messages"])

@app.get("/")
async def root():
    return {"message": "API de Mensagens Futuras"} 