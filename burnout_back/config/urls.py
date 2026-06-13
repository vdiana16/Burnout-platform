"""
Configurația principală a rutelor pentru întregul proiect.
Definește rutele pentru panoul de administrare, endpoint-urile de autentificare
securizată pe bază de token-uri (JWT) și include rutele specifice aplicației 'core'.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import ( TokenRefreshView)
from core.views.authView import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutele pentru Autentificare 
    path('api/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('core.urls')),
]