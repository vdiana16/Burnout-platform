from rest_framework import serializers
from .models import User, Institution, PsychologistProfile, StudentProfile, Question, TestResult, Message 
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        institution_name = "Fără instituție"
        
        if self.user.role == 'STUDENT' and hasattr(self.user, 'student_profile'):
            if self.user.student_profile.institution:
                institution_name = self.user.student_profile.institution.name
                
        elif self.user.role == 'PSYCHOLOGIST' and hasattr(self.user, 'psychologist_profile'):
            if self.user.psychologist_profile.institution:
                institution_name = self.user.psychologist_profile.institution.name

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name, 
            'email': self.user.email,         
            'role': self.user.role, 
            'institution_name': institution_name
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
    
    assigned_psychologist = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'institution', 'age', 
            'education_level', 'study_stage', 'field', 
            'academic_gpa', 'employment','assigned_psychologist'
        ]

    def get_assigned_psychologist(self, obj):
        if obj.institution:
            psych_profile = PsychologistProfile.objects.filter(institution=obj.institution).first()
            if psych_profile:
                return {
                    "id": psych_profile.user.id,
                    "first_name": psych_profile.user.first_name,
                    "last_name": psych_profile.user.last_name,
                    "email": psych_profile.user.email
                }
        return None

class StudentListSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    last_diagnostic = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = ['id', 'user_id', 'first_name', 'last_name', 'email', 'education_level', 'study_stage', 'field', 'last_diagnostic']

    def get_last_diagnostic(self, obj):
        ultimul_test = TestResult.objects.filter(student=obj).order_by('-taken_at').first()
        if ultimul_test:
            return ultimul_test.predicted_cluster
        return "Fără evaluări"

class PsychologistProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True, default="Nespecificată")

    class Meta:
        model = PsychologistProfile
        fields = [
            'id', 'first_name', 'last_name', 'email', 'institution_name',
            'phone_number', 'specialization', 'bio', 'office_location', 'title'
        ]

class RegisterSerializer(serializers.ModelSerializer):
    institution = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), 
        required=False
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role', 'institution')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        password = data.get('password')
        
        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return data

    @transaction.atomic
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
            StudentProfile.objects.create(
                user=user, 
                institution=institution, 
            )
        elif user.role == 'PSYCHOLOGIST':
            PsychologistProfile.objects.create(
                user=user, 
                institution=institution
            )

        return user
    
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'order', 'text', 'category', 'is_numeric']

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'responses', 'predicted_cluster', 'taken_at', 'psychologist_notes']
        read_only_fields = ['id', 'predicted_cluster', 'taken_at', 'psychologist_notes']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        if not hasattr(user, 'student_profile'):
            raise serializers.ValidationError("Doar studenții pot trimite teste.")
        
        student_profile = user.student_profile

        test_result = TestResult.objects.create(
            student=student_profile,
            responses=validated_data['responses']
        )

        return test_result
    
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = Message
        fields = [
            'id', 
            'sender', 
            'sender_username', 
            'receiver', 
            'content', 
            'timestamp', 
            'is_read'
        ]
        read_only_fields = ['timestamp']