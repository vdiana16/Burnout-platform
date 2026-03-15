from django.db import models
from django.contrib.auth.models import AbstractUser

class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('PSYCHOLOGIST', 'Psychologist'),
        ('ADMIN', 'Admin'), 
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return f"{self.username} ({self.role})"

class PsychologistProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='psychologist_profile')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='psychologists')

    def __str__(self):
        return f"Dr. {self.user.last_name}"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    institution = models.ForeignKey('Institution', on_delete=models.SET_NULL, null=True, blank=True)
    GENDER_CHOICES = (('Feminin', 'Feminin'), ('Masculin', 'Masculin'), ('Nespecificat', 'Nespecificat'))
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='Nespecificat')
    age = models.IntegerField(null=True, blank=True)
    EDU_CHOICES = (('Liceu', 'Liceu'), ('Licență', 'Licență'), ('Master', 'Master'), ('Doctorat', 'Doctorat'))
    education_level = models.CharField(max_length=20, choices=EDU_CHOICES, null=True, blank=True)
    STAGE_CHOICES = (('Anul 1', 'Anul 1'), ('Anul 2', 'Anul 2'), ('Anul 3', 'Anul 3'), ('An Terminal', 'An Terminal'))
    study_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, null=True, blank=True)
    FIELD_CHOICES = (
        ('Real', 'Real / Inginerie / Științe Exacte'),
        ('Uman', 'Uman / Social / Litere / Psihologie'),
        ('Medicină', 'Medicină / Sănătate'),
        ('Economic', 'Economic / Business'),
        ('Vocațional', 'Vocațional / Arte / Sport'),
    )
    field = models.CharField(max_length=50, choices=FIELD_CHOICES, null=True, blank=True)    
    academic_gpa = models.FloatField(null=True, blank=True)
    financial_stress = models.IntegerField(null=True, blank=True, help_text="1 to 5")
    EMP_CHOICES = (('Nu', 'Nu'), ('Part-time', 'Part-time'), ('Full-time', 'Full-time'))
    employment = models.CharField(max_length=20, choices=EMP_CHOICES, default='Nu')

    def __str__(self):
        return f"Profil: {self.user.username}"