from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from ..database import get_database
from ..auth import pwd_context, create_access_token
from datetime import timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        db = get_database()
        user = db.users.find_one({"phone": form_data.username})
        
        if not user or not pwd_context.verify(form_data.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Telefone ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Criar token de acesso
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user["_id"])},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Erro ao fazer login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar login"
        ) 