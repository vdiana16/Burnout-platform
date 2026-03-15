from django.db import models

class Question(models.Model):
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
    student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE, related_name='test_results')
    taken_at = models.DateTimeField(auto_now_add=True)
    
    responses = models.JSONField(default=dict, help_text="Răspunsurile brute la formular")
    predicted_cluster = models.CharField(max_length=50, null=True, blank=True, help_text="Clusterul prezis de XGBoost")
    
    psychologist_notes = models.TextField(blank=True, null=True, help_text="Planul de intervenție")

    def __str__(self):
        return f"Test {self.student.user.username} - {self.taken_at.strftime('%Y-%m-%d')}"