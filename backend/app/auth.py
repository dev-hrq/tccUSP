from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from .database import get_database
import logging

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Por enquanto, estamos usando um token fake
        # Em produção, você deve implementar a verificação real do token
        if token != "fake_token":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Buscar o usuário no banco de dados
        db = get_database()
        # Por enquanto, estamos usando um usuário fixo
        # Em produção, você deve buscar o usuário real baseado no token
        user = db.users.find_one({})  # Buscar qualquer usuário (por enquanto)
        
        if not user:
            logger.error("Usuário não encontrado")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Usuário encontrado: {user}")
        return {
            "id": str(user["_id"]),  # ID do usuário que está logado
            "phone": user["phone"]  # Telefone do usuário que está logado
        }
    except Exception as e:
        logger.error(f"Erro ao buscar usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar autenticação"
        ) 