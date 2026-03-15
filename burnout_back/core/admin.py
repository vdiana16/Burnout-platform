from django.contrib import admin
from .models import User, Institution, PsychologistProfile, StudentProfile, TestResult, Question

admin.site.register(User)
admin.site.register(Institution)
admin.site.register(PsychologistProfile)
admin.site.register(StudentProfile)
admin.site.register(TestResult)

class QuestionAdmin(admin.ModelAdmin):
    list_display = ('order', 'text', 'category', 'ml_feature_name', 'is_numeric', 'is_reverse')
    list_editable = ('ml_feature_name', 'is_numeric', 'is_reverse')
    ordering = ('order',)

admin.site.register(Question, QuestionAdmin)