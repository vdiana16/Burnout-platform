import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Traseul HTTP clasic (trebuie inițializat primul)
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from core import routing # Importăm rutele create la Pasul 6

application = ProtocolTypeRouter({
    "http": django_asgi_app, # Rutele HTTP normale (API-ul tău cu axios)
    "websocket": URLRouter(
        routing.websocket_urlpatterns # Rutele WebSocket pentru chat
    ),
})