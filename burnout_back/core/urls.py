from django.urls import path
from .views.authView import RegisterView, InstitutionListView
from .views.testsView import QuestionListView, SubmitTestView, ResultsView
from .views.profilesView import StudentProfileView, PsychologistProfileView

urlpatterns = [
    # --- AUTH & USERS ---
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('institutions/', InstitutionListView.as_view(), name='institution_list'),
    
    # --- STUDENT PROFILE ---
    path('students/me/', StudentProfileView.as_view(), name='student-profile'), 
    
    # --- EVALUĂRI / TESTE ---
    path('questions/', QuestionListView.as_view(), name='questions-list'),
    
    # Aici folosim aceeași resursă (tests), dar face lucruri diferite în funcție de metoda HTTP (GET vs POST)
    path('tests/', ResultsView.as_view(), name='test-list'), 
    path('tests/submit/', SubmitTestView.as_view(), name='test-submit'), 

    # --- PSYCHOLOGIST PROFILE
    path('psychologists/me/', PsychologistProfileView.as_view(), name='psychologist-profile'),

]