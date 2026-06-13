"""
Configurarea WSGI pentru proiect.
Acest fișier expune punctul de intrare pentru serverele web sincrone
necesare pentru a putea rula aplicația Django într-un mediu de producție clasic.
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
