import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model
from .models.users import Message

User = get_user_model()

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # Extragem ID-ul studentului din URL-ul prin care se face conexiunea
        self.student_id = self.scope['url_route']['kwargs']['student_id']
        self.room_group_name = f'chat_student_{self.student_id}'

        # Adăugăm utilizatorul în "camera" de chat a acestui student
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept() # Acceptăm conexiunea

    def disconnect(self, close_code):
        # Când cineva închide tab-ul, îl scoatem din cameră
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Această funcție rulează când React-ul trimite un mesaj NOU către Django
    def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data['message']
        sender_id = data['sender_id']
        receiver_id = data['receiver_id']

        # 1. Salvăm mesajul în Baza de Date
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        Message.objects.create(sender=sender, receiver=receiver, content=message_content)

        # 2. Trimitem mesajul (Broadcast) tuturor celor conectați în această cameră (studentul și psihologul)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'sender_id': sender_id
            }
        )

    # Această funcție primește mesajul de la group_send și îl trimite fizic spre Frontend (React)
    def chat_message(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id']
        }))