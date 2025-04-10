# Implementação do Twilio para Envio de SMS

Este documento descreve como implementar a integração com a API do Twilio para envio de SMS no sistema NotifyX.

## Pré-requisitos

1. Conta no Twilio (https://www.twilio.com)
2. Número de telefone Twilio ativado para SMS
3. Account SID e Auth Token do Twilio
4. Python 3.12 ou superior
5. Biblioteca `twilio` instalada

## Configuração Inicial

### 1. Instalação da Biblioteca Twilio

```bash
pip install twilio
```

### 2. Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env` do backend:

```env
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=seu_numero_twilio
```

### 3. Criação do Módulo de Serviço Twilio

Crie um novo arquivo `backend/twilio_service.py`:

```python
import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.client = Client(self.account_sid, self.auth_token)

    def send_sms(self, to_number: str, message: str) -> dict:
        """
        Envia um SMS usando a API do Twilio
        
        Args:
            to_number (str): Número do destinatário no formato E.164
            message (str): Conteúdo da mensagem
            
        Returns:
            dict: Informações sobre o envio da mensagem
        """
        try:
            # Remove caracteres não numéricos do número
            to_number = ''.join(filter(str.isdigit, to_number))
            
            # Adiciona o código do país se necessário
            if not to_number.startswith('55'):
                to_number = f'55{to_number}'
            
            # Adiciona o prefixo + para o formato E.164
            to_number = f'+{to_number}'
            
            # Envia a mensagem
            message = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_number
            )
            
            return {
                'status': 'success',
                'message_sid': message.sid,
                'status_code': message.status,
                'error_code': None,
                'error_message': None
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message_sid': None,
                'status_code': None,
                'error_code': str(e.code) if hasattr(e, 'code') else None,
                'error_message': str(e.msg) if hasattr(e, 'msg') else str(e)
            }
```

### 4. Integração com o Sistema de Mensagens

Modifique o arquivo `backend/rabbitmq_config.py` para incluir o envio de SMS:

```python
from twilio_service import TwilioService

# ... código existente ...

def process_message(ch, method, properties, body):
    try:
        message_data = json.loads(body)
        
        # Envia o SMS usando o Twilio
        twilio_service = TwilioService()
        sms_result = twilio_service.send_sms(
            to_number=message_data['recipient_phone'],
            message=message_data['message']
        )
        
        if sms_result['status'] == 'success':
            # Atualiza o status da mensagem no MongoDB
            update_message_status(message_data['id'], 'sent')
            print(f"SMS enviado com sucesso para {message_data['recipient_phone']}")
        else:
            # Atualiza o status da mensagem com erro
            update_message_status(message_data['id'], 'failed')
            print(f"Erro ao enviar SMS: {sms_result['error_message']}")
            
    except Exception as e:
        print(f"Erro ao processar mensagem: {str(e)}")
        update_message_status(message_data['id'], 'failed')
```

## Testando a Implementação

### 1. Teste Direto

Crie um script de teste `backend/test_twilio.py`:

```python
from twilio_service import TwilioService

def test_send_sms():
    twilio = TwilioService()
    result = twilio.send_sms(
        to_number="5511999999999",  # Substitua pelo número de teste
        message="Teste de envio de SMS do NotifyX"
    )
    print(result)

if __name__ == "__main__":
    test_send_sms()
```

### 2. Teste via API

Modifique a rota de envio de mensagens em `backend/main.py`:

```python
from twilio_service import TwilioService

@app.post("/messages/test-sms")
async def test_sms(phone: str):
    twilio = TwilioService()
    result = twilio.send_sms(
        to_number=phone,
        message="Teste de envio de SMS do NotifyX"
    )
    return result
```

## Considerações de Segurança

1. Nunca exponha o Account SID e Auth Token no código
2. Use variáveis de ambiente para armazenar credenciais
3. Implemente rate limiting para evitar abuso
4. Valide números de telefone antes do envio
5. Implemente logs detalhados para auditoria

## Tratamento de Erros

O serviço Twilio pode retornar vários códigos de erro. Implemente o tratamento adequado:

```python
ERROR_CODES = {
    '21211': 'Número de telefone inválido',
    '21608': 'Número não habilitado para SMS',
    '21614': 'Número não é um celular',
    '30003': 'Número não autorizado',
    '30004': 'Número bloqueado',
    '30005': 'Número desconhecido',
    '30006': 'Número inválido',
    '30007': 'Número não habilitado para SMS',
}

def handle_twilio_error(error_code: str) -> str:
    return ERROR_CODES.get(error_code, 'Erro desconhecido ao enviar SMS')
```

## Monitoramento e Logs

Implemente logs detalhados para monitorar o uso do serviço:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('twilio_service')

class TwilioService:
    def send_sms(self, to_number: str, message: str) -> dict:
        try:
            # ... código existente ...
            
            logger.info(f"SMS enviado com sucesso para {to_number}")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao enviar SMS para {to_number}: {str(e)}")
            return error_result
```

## Próximos Passos

1. Implementar sistema de retry para mensagens falhas
2. Adicionar suporte a templates de mensagem
3. Implementar sistema de relatórios de entrega
4. Adicionar suporte a mensagens em massa
5. Implementar sistema de blacklist para números problemáticos

## Referências

- [Documentação Oficial do Twilio](https://www.twilio.com/docs)
- [Python Twilio Helper Library](https://www.twilio.com/docs/libraries/python)
- [Twilio REST API](https://www.twilio.com/docs/usage/api) 