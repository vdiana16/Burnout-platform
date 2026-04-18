from core.serializers import StudentProfileSerializer, PsychologistProfileSerializer, StudentListSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.models.users import StudentProfile, PsychologistProfile 

class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data)
        except Exception:
            return Response({"detail": "Profil negăsit"}, status=404)

    def patch(self, request):
        try:
            profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            profile = StudentProfile(user=request.user)

        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        print(serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        return self.patch(request)

class PsychologistProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.psychologist_profile
            serializer = PsychologistProfileSerializer(profile)
            return Response(serializer.data)
        except Exception:
            return Response({"detail": "Profil psiholog negăsit"}, status=404)

    def patch(self, request):
        try:
            profile = request.user.psychologist_profile
        except PsychologistProfile.DoesNotExist:
            profile = PsychologistProfile(user=request.user)

        serializer = PsychologistProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        print(serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        return self.patch(request)
    
class PsychologistStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # 1. Verificăm dacă cel logat este psiholog și are o instituție
        if hasattr(user, 'psychologist_profile') and user.psychologist_profile.institution:
            institutie_psiholog = user.psychologist_profile.institution
            
            # 2. Căutăm TOȚI studenții care au ACEEAȘI instituție
            studenti = StudentProfile.objects.filter(institution=institutie_psiholog)
            
            # 3. Îi trimitem către React folosind serializatorul de listă
            serializer = StudentListSerializer(studenti, many=True)
            return Response(serializer.data)
            
        return Res