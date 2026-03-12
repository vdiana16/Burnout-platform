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