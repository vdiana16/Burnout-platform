"""
Configurarea principală ASGI pentru aplicație.
Rutează traficul HTTP standard către Django și traficul WebSocket 
către rutele asincrone definite în modulul 'core'.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from core import routing 

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        routing.websocket_urlpatterns 
    ),
})