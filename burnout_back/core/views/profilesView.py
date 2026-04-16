from core.serializers import StudentProfileSerializer 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data)
        except Exception:
            return Response({"detail": "Profil negăsit"}, status=404)

    def post(self, request):
        from core.models import StudentProfile
        profile, created = StudentProfile.objects.update_or_create(
            user=request.user,
            defaults=request.data
        )
        return Response({"message": "Profil salvat!"})