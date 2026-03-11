from django.contrib import admin
from .models import User, Institution, PsychologistProfile, StudentProfile, TestResult

admin.site.register(User)
admin.site.register(Institution)
admin.site.register(PsychologistProfile)
admin.site.register(StudentProfile)
admin.site.register(TestResult)