"""
Definirea modelelor de date pentru evaluarea nivelului de burnout.
Aceste modele stochează structura chestionarului și rezultatele obținute 
în urma procesării răspunsurilor prin algoritmul de machine learning.
"""
from django.db import models
from django.utils import timezone

class Question(models.Model):
    """
    Modelul pentru întrebările chestionarului.
    Fiecare întrebare este mapată la o trăsătură specifică
    necesară algoritmului XGBoost pentru a realiza predicția.
    """
    text = models.CharField(max_length=500)
    category = models.CharField(max_length=100, null=True, blank=True)
    
    ml_feature_name = models.CharField(max_length=100, null=True, blank=True, help_text="Ex: procrastination_score") 
    is_reverse = models.BooleanField(default=False, help_text="Bifează doar dacă scorul e inversat (ex: Reziliență)") 
    
    order = models.IntegerField(default=0) 
    is_numeric = models.BooleanField(default=False) 

    class Meta:
        ordering = ['order'] 

    def __str__(self):
        return f"{self.order}. {self.text[:50]}"


class TestResult(models.Model):
    """
    Modelul pentru stocarea rezultatelor evaluării unui student.
    Salvează răspunsurile brute și clasa de risc prezisă
    de modelul XGBoost, alături de posibilele notițe ale psihologului.
    """
    student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE, related_name='test_results')
    taken_at = models.DateTimeField(default=timezone.now)

    responses = models.JSONField(default=dict, help_text="Răspunsurile brute la formular")
    predicted_cluster = models.CharField(max_length=50, null=True, blank=True, help_text="Clusterul prezis de XGBoost")
    
    psychologist_notes = models.TextField(blank=True, null=True, help_text="Planul de intervenție")

    def __str__(self):
        return f"Test {self.student.user.username} - {self.taken_at.strftime('%Y-%m-%d')}"