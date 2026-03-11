from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('PSYCHOLOGIST', 'Psychologist'),
        ('ADMIN', 'Admin'), 
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return f"{self.username} ({self.role})"

class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PsychologistProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='psychologist_profile')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='psychologists')

    def __str__(self):
        return f"Dr. {self.user.last_name}"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    age = models.IntegerField(null=True, blank=True)
    study_year = models.CharField(max_length=50, blank=True, null=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

class TestResult(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='test_results')
    taken_at = models.DateTimeField(auto_now_add=True)
    responses = models.JSONField(default=dict, help_text="Răspunsurile brute la formular")
    predicted_cluster = models.IntegerField(null=True, blank=True, help_text="Clusterul prezis de XGBoost")
    psychologist_notes = models.TextField(blank=True, null=True, help_text="Planul de intervenție")

    def __str__(self):
        return f"Test {self.student.user.username} - {self.taken_at.strftime('%Y-%m-%d')}"