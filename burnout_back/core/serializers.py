from rest_framework import serializers
from .models import User, Institution, PsychologistProfile, StudentProfile, TestResult
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'role': self.user.role, 
            'institution_name': self.user.institution.name if self.user.institution else "Fără instituție"
        }
        return data


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    institution = InstitutionSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'institution', 'age', 'study_year', 'is_approved']

class PsychologistProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    institution = InstitutionSerializer(read_only=True)

    class Meta:
        model = PsychologistProfile
        fields = ['id', 'user', 'institution']

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'student', 'taken_at', 'responses', 'predicted_cluster', 'psychologist_notes']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(),
        source='institution',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role', 'institution_id')

    def create(self, validated_data):
        institution = validated_data.pop('institution', None)
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data['role']
        )
        user.set_password(validated_data['password'])
        user.save()

        if user.role == 'STUDENT':
            StudentProfile.objects.create(user=user, institution=institution, is_approved=False)
        elif user.role == 'PSYCHOLOGIST':
            PsychologistProfile.objects.create(user=user, institution=institution)

        return user