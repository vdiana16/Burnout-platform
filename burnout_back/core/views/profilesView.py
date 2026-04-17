from core.serializers import StudentProfileSerializer, PsychologistProfileSerializer
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