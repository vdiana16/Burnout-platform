"""
Definirea modelelor principale ale aplicației.
Include entitățile pentru gestionarea autentificării bazate pe roluri,
profilele detaliate ale utilizatorilor, instituțiile afiliate și 
sistemul de mesagerie internă.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser

class Institution(models.Model):
    """
    Model pentru entitățile educaționale.
    Permite gruparea studenților și a psihologilor în funcție 
    de universitatea sau liceul de care aparțin.
    """
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    """
    Modelul central de utilizator, extins din clasa de bază Django.
    Implementează un sistem de autorizare bazat pe roluri pentru a 
    direcționa corect traficul și permisiunile în interfața aplicației.
    """
    email = models.EmailField(unique=True, error_messages={
        'unique': "Un utilizator cu această adresă de email există deja."
    })
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('PSYCHOLOGIST', 'Psychologist'),
        ('ADMIN', 'Admin'), 
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return f"{self.username} ({self.role})"

class PsychologistProfile(models.Model):
    """
    Profilul extins pentru specialiștii în sănătate mintală.
    Asociat printr-o relație One-to-One cu modelul User, stochează 
    detaliile profesionale necesare pentru programări și consiliere.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='psychologist_profile')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    office_location = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True) # ex: Psiholog Clinician

    def __str__(self):
        return f"Psychologist: {self.user.username}"

class StudentProfile(models.Model):
    """
    Profilul extins pentru studenți/elevi.
    Aici sunt stocate caracteristicile demografice și academice care 
    servesc drept predictori de bază pentru modelul de machine learning XGBoost.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    institution = models.ForeignKey('Institution', on_delete=models.SET_NULL, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    EDU_CHOICES = (('Liceu', 'Liceu'), ('Licență', 'Licență'), ('Master', 'Master'), ('Doctorat', 'Doctorat'))
    education_level = models.CharField(max_length=20, choices=EDU_CHOICES, null=True, blank=True)
    STAGE_CHOICES = (('Anul 1', 'Anul 1'), ('Anul 2', 'Anul 2'), ('Anul 3', 'Anul 3'), ('Anul 4+', 'Anul 4+'))
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
    EMPLOYMENT_CHOICES = (
        ('Nu', 'Nu'),
        ('Part-time', 'Part-time'),
        ('Full-time', 'Full-time')
    )
    employment = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES, null=True, blank=True)
    
    def __str__(self):
        return f"Profil: {self.user.username}"
    
class Message(models.Model):
    """
    Modelul pentru gestionarea comunicării.
    Stochează istoricul mesajelor asincrone schimbate între studenți și psihologi,
    fiind baza pentru funcționalitatea de chat în timp real via WebSockets.
    """
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp'] 

    def __str__(self):
        return f"De la {self.sender.username} pt {self.receiver.username} - {self.timestamp.strftime('%H:%M')}"