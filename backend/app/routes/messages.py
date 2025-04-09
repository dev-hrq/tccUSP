from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from ..models.message import Message, MessageInput
from ..database import get_database
from ..auth import get_current_user
import logging
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/messages", response_model=Message)
async def create_message(message: MessageInput, current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Recebendo mensagem: {message.model_dump()}")
        logger.info(f"Usuário atual: {current_user}")
        
        db = get_database()
        message_dict = message.model_dump()
        
        # Gerar um ID único para a mensagem
        message_id = str(uuid.uuid4())
        message_dict["_id"] = message_id
        
        # Usar o ID do usuário atual como sender_id
        message_dict["sender_id"] = current_user["id"]
        message_dict["created_at"] = datetime.utcnow().isoformat()
        message_dict["status"] = "Processando"
        
        # Garantir que event_date seja uma string ISO
        if isinstance(message_dict["event_date"], datetime):
            message_dict["event_date"] = message_dict["event_date"].isoformat()
        
        logger.info(f"Mensagem processada: {message_dict}")
        
        # Inserir a mensagem com o ID gerado
        db.messages.insert_one(message_dict)
        
        # Retornar a mensagem com o ID gerado
        message_dict["id"] = message_id
        return Message(**message_dict)
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages", response_model=List[Message])
async def get_messages(current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Buscando mensagens para usuário: {current_user['id']}")
        db = get_database()
        messages = list(db.messages.find({"sender_id": current_user["id"]}).limit(100))
        
        # Converter os campos datetime para string ISO e garantir que o id esteja presente
        for msg in messages:
            if isinstance(msg.get("event_date"), datetime):
                msg["event_date"] = msg["event_date"].isoformat()
            if isinstance(msg.get("created_at"), datetime):
                msg["created_at"] = msg["created_at"].isoformat()
            msg["id"] = msg["_id"]  # Garantir que o campo id esteja presente
        
        logger.info(f"Retornando {len(messages)} mensagens")
        return [Message(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erro ao buscar mensagens: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 