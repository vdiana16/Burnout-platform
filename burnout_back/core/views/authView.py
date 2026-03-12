from rest_framework import generics
from rest_framework.permissions import AllowAny
from core.models import User, Institution
from core.serializers import RegisterSerializer, InstitutionSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class InstitutionListView(generics.ListAPIView):
    queryset = Institution.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = InstitutionSerializer