"""
Configurarea rutelor pentru API-ul aplicației.
Acest modul mapează endpoint-urile HTTP la clasele de tip 'view' corespunzătoare,
organizând resursele aplicației în funcție de funcționalitate:
autentificare, profile, evaluări psihologice și mesagerie.
"""
from django.urls import path
from .views.authView import RegisterView, InstitutionListView
from .views.testsView import QuestionListView, SubmitTestView, ResultsView
from .views.profilesView import StudentProfileView, PsychologistProfileView, PsychologistStudentsView, MessageHistoryView

urlpatterns = [
    # --- AUTH & USERS ---
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('institutions/', InstitutionListView.as_view(), name='institution_list'),
    
    # --- STUDENT PROFILE ---
    path('students/me/', StudentProfileView.as_view(), name='student-profile'), 
    
    # --- EVALUĂRI / TESTE ---
    path('questions/', QuestionListView.as_view(), name='questions-list'),
    path('tests/', ResultsView.as_view(), name='test-list'), 
    path('tests/submit/', SubmitTestView.as_view(), name='test-submit'), 

    # --- PSYCHOLOGIST PROFILE
    path('psychologists/me/', PsychologistProfileView.as_view(), name='psychologist-profile'),
    path('psychologist/students/', PsychologistStudentsView.as_view(), name='psychologist-students'),

    # --- CHAT ---
    path('messages/', MessageHistoryView.as_view(), name='messages-history'),

]