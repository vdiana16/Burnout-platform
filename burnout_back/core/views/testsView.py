import os
import joblib
import pandas as pd
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Question, TestResult
from core.serializers import QuestionSerializer, TestResultSerializer

# Incarcare modele ML
ML_MODELS_DIR = os.path.join(settings.BASE_DIR, 'core', 'ml_models')
xgb_model = joblib.load(os.path.join(ML_MODELS_DIR, 'xgboost_burnout_model.pkl'))
scaler = joblib.load(os.path.join(ML_MODELS_DIR, 'scaler.pkl'))
label_encoder = joblib.load(os.path.join(ML_MODELS_DIR, 'label_encoder.pkl'))

class QuestionListView(generics.ListAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

class SubmitTestView(generics.CreateAPIView):
    serializer_class = TestResultSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        
        if not hasattr(user, 'student_profile'):
            return Response({"error": "Doar studenții pot face acest test."}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = user.student_profile
        
        # Extragem lista de raspunsuri din request
        responses = request.data.get('responses', {})
        if not responses or len(responses) < 31:  
            return Response(
                {"error": "Date incomplete. Te rugăm să răspunzi la toate întrebările."}, 
                status=status.HTTP_400_BAD_REQUEST
            )


        # Functie helper pentru a extrage valori din lista de obiecte [{question_order, value}, ...]
        def get_val(q_num):
            # Caută cheia "Q9", "Q10" etc. direct în dicționar. Dacă nu există, returnează 3.0
            return float(responses.get(f"Q{q_num}", 3.0))

        # --- Calcule pentru Modelul ML ---
        interest_motivation = (get_val(9) + get_val(12)) / 2
        satisfaction_recognition = (get_val(10) + get_val(13) + get_val(14)) / 3
        procrastination_score = (get_val(16) + get_val(17)) / 2
        organization_score = get_val(18)
        sleep_quality_score = (get_val(21) + get_val(23)) / 2
        sleep_difficulty_score = get_val(22)
        digital_stress_score = (get_val(28) + get_val(29)) / 2
        screens_before_sleep_score = get_val(30)
        stress_negative_affect = (get_val(31) + get_val(32) + get_val(41)) / 3
        pressure_perfectionism = (get_val(33) + get_val(34) + get_val(35)) / 3
        social_support_score = (get_val(36) + get_val(37)) / 2
        isolation_score = get_val(38)
        self_criticism_score = get_val(39)
        low_resilience_score = 6 - get_val(40) 

        study_hours = get_val(15)
        sleep_hours = get_val(20)
        
        # --- Gestionare Stres Financiar (Q7) ---
        financial_stress = get_val(7)
        profile.financial_stress = int(financial_stress)
        profile.study_hours = study_hours
        profile.sleep_hours = sleep_hours
        profile.save() # Salveaza datele dinamice pe profil pentru psiholog

        # --- Pregatire date pentru Predictie ---
        edu_map = {'Liceu': 1, 'Licență': 2, 'Master': 3, 'Doctorat': 4}
        emp_map = {'Nu': 0, 'Part-time': 1, 'Full-time': 2}
        
        education_level = edu_map.get(profile.education_level, 2) 
        employment = emp_map.get(profile.employment, 0)
        age = profile.age if profile.age else 21
        academic_gpa = profile.academic_gpa if profile.academic_gpa else 8.0

        feature_names = [
            'interest_motivation', 'satisfaction_recognition', 'procrastination_score', 
            'organization_score', 'sleep_quality_score', 'sleep_difficulty_score', 
            'digital_stress_score', 'screens_before_sleep_score', 'stress_negative_affect', 
            'pressure_perfectionism', 'social_support_score', 'isolation_score', 
            'self_criticism_score', 'low_resilience_score', 'age', 'education_level', 
            'employment', 'study_hours', 'sleep_hours', 'academic_gpa'
        ]
        
        data_dict = {
            'interest_motivation': interest_motivation,
            'satisfaction_recognition': satisfaction_recognition,
            'procrastination_score': procrastination_score,
            'organization_score': organization_score,
            'sleep_quality_score': sleep_quality_score,
            'sleep_difficulty_score': sleep_difficulty_score,
            'digital_stress_score': digital_stress_score,
            'screens_before_sleep_score': screens_before_sleep_score,
            'stress_negative_affect': stress_negative_affect,
            'pressure_perfectionism': pressure_perfectionism,
            'social_support_score': social_support_score,
            'isolation_score': isolation_score,
            'self_criticism_score': self_criticism_score,
            'low_resilience_score': low_resilience_score,
            'age': age,
            'education_level': education_level,
            'employment': employment,
            'study_hours': study_hours,
            'sleep_hours': sleep_hours,
            'academic_gpa': academic_gpa
        }

        df_pred = pd.DataFrame([data_dict], columns=feature_names)
        X_scaled = scaler.transform(df_pred)
        prediction_encoded = xgb_model.predict(X_scaled)
        final_cluster = label_encoder.inverse_transform(prediction_encoded)[0]

        # --- Salvare Rezultat Test ---
        # AICI am corectat responses=responses_list
        test_result = TestResult.objects.create(
            student=profile,
            responses=responses, 
            predicted_cluster=final_cluster
        )

        return Response({
            "message": "Test finalizat cu succes!",
            "predicted_cluster": final_cluster
        }, status=status.HTTP_201_CREATED)

class ResultsView(generics.ListAPIView):
    serializer_class = TestResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Preluăm ID-ul studentului din request (dacă există)
        # Ex: GET /api/.../results/?student_id=4
        student_id = self.request.query_params.get('student_id')

        # Cazul 1: Un psiholog cere istoricul unui anumit student
        if student_id and hasattr(user, 'psychologist_profile'):
            psychologist = user.psychologist_profile
            
            # Returnăm testele studentului doar dacă sunt de la aceeași instituție
            return TestResult.objects.filter(
                student__id=student_id,
                student__institution=psychologist.institution
            ).order_by('-taken_at')

        # Cazul 2: Un student își cere propriul istoric (comportamentul original)
        if hasattr(user, 'student_profile'):
            return TestResult.objects.filter(student=user.student_profile).order_by('-taken_at')
            
        # Dacă nu e nici student, nici psiholog cu student_id valid, returnăm listă goală
        return TestResult.objects.none()