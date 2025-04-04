import pika
import json
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def publish_message(message_data):
    # Adiciona timestamp à mensagem
    message_data["timestamp"] = datetime.now().isoformat()
    
    # Configuração da conexão com o RabbitMQ
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=os.getenv("RABBITMQ_HOST", "localhost"),
            port=int(os.getenv("RABBITMQ_PORT", 5672)),
            credentials=pika.PlainCredentials(
                os.getenv("RABBITMQ_USER", "guest"),
                os.getenv("RABBITMQ_PASSWORD", "guest")
            )
        )
    )
    
    channel = connection.channel()
    
    # Declara a fila
    channel.queue_declare(queue="mensagens_futuras")
    
    # Publica a mensagem
    channel.basic_publish(
        exchange="",
        routing_key="mensagens_futuras",
        body=json.dumps(message_data)
    )
    
    connection.close() 