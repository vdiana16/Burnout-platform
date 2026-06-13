"""
Implementarea consumatorului WebSocket ChatConsumer.
Acest modul gestionează conexiunile persistente bidirecționale, 
asigurând transmiterea instantanee a mesajelor între studenți și psihologi.
"""
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model
from .models.users import Message

User = get_user_model()

class ChatConsumer(WebsocketConsumer):
    """
    Gestionează ciclul de viață al unei conexiuni WebSocket:
    conectare, primire mesaje, salvare în DB și broadcast către clienți.
    """
    def connect(self):
        # Extragem ID-ul studentului din URL-ul prin care se face conexiunea
        self.student_id = self.scope['url_route']['kwargs']['student_id']
        self.room_group_name = f'chat_student_{self.student_id}'

        # Adăugăm utilizatorul în "camera" de chat a acestui student
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept() 

    def disconnect(self, close_code):
        # Eliminăm utilizatorul din grup la închiderea conexiunii
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        """
        Funcție apelată la primirea unui mesaj de la clientul frontend (React).
        Salvează mesajul în baza de date și inițiază broadcast-ul.
        """
        data = json.loads(text_data)
        message_content = data['message']
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')

        # Verificăm dacă primim ambele ID-uri valide
        if not sender_id or not receiver_id:
            print("Eroare: Lipsesc ID-urile pentru expeditor sau destinatar.")
            return

        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            Message.objects.create(sender=sender, receiver=receiver, content=message_content)

            # Trimitem mesajul Broadcast tuturor celor conectați
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_content,
                    'sender_id': sender_id
                }
            )
        except User.DoesNotExist:
            print(f"Eroare DB: Userul {sender_id} sau destinatarul {receiver_id} nu a fost găsit.")

    def chat_message(self, event):
        """
        Funcție de tip handler: trimite mesajul către toți clienții conectați.
        """
        self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id']
        }))