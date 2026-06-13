from rest_framework import generics
from rest_framework.permissions import AllowAny
from core.models import User, Institution
from core.serializers import RegisterSerializer, InstitutionSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Personalizează procesul de login JWT pentru a returna detalii 
    suplimentare despre utilizator la autentificare.
    """
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    """Endpoint public pentru înregistrarea de noi utilizatori."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class InstitutionListView(generics.ListAPIView):
    """Endpoint public pentru a obține lista instituțiilor (ex: pentru dropdown)."""
    queryset = Institution.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = InstitutionSerializer