"""
Configurarea rutării pentru WebSockets.
Definește pattern-urile URL-urilor prin care aplicația gestionează 
comunicarea asincronă în timp real între clienți.
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<student_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]