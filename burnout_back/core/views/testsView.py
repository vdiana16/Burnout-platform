import os
import joblib
import pandas as pd
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Question, TestResult
from core.serializers import QuestionSerializer, TestResultSerializer

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
        responses = request.data.get('responses', {})

        def get_val(q_num):
            return float(responses.get(f"Q{q_num}", 3))

        interest_motivation = (get_val(9) + get_val(12)) / 2
        satisfaction_recognition = (get_val(10) + get_val(13) + get_val(14)) / 3
        procrastination_score = (get_val(16) + get_val(17)) / 2
        organization_score = get_val(18)
        sleep_quality_score = (get_val(21) + get_val(23)) / 2
        balanced_lifestyle_score = (get_val(24) + get_val(25)) / 2
        digital_stress_score = (get_val(28) + get_val(29)) / 2
        stress_negative_affect = (get_val(31) + get_val(32) + get_val(41)) / 3
        pressure_perfectionism = (get_val(33) + get_val(34) + get_val(35)) / 3
        social_support_score = (get_val(36) + get_val(37)) / 2

        sleep_difficulty_score = get_val(22)
        stimulant_use = get_val(26)
        screens_before_sleep_score = get_val(30)
        isolation_score = get_val(38)
        self_criticism_score = get_val(39)
        low_resilience_score = 6 - get_val(40) 

        study_hours = get_val(15)
        sleep_hours = get_val(20)
        online_hours = get_val(27)

        edu_map = {'Liceu': 1, 'Licență': 2, 'Master': 3, 'Doctorat': 4}
        emp_map = {'Nu': 0, 'Part-time': 1, 'Full-time': 2}
        
        education_level = edu_map.get(profile.education_level, 2) 
        employment = emp_map.get(profile.employment, 0)
        age = profile.age if profile.age else 21
        academic_gpa = profile.academic_gpa if profile.academic_gpa else 8.0

        gender_Feminin = 1 if profile.gender == 'Feminin' else 0
        gender_Masculin = 1 if profile.gender == 'Masculin' else 0
        gender_Prefer_sa_nu_raspund = 1 if profile.gender not in ['Feminin', 'Masculin'] else 0

        feature_names = [
            'interest_motivation', 'satisfaction_recognition', 'procrastination_score', 
            'organization_score', 'sleep_quality_score', 'sleep_difficulty_score', 
            'balanced_lifestyle_score', 'stimulant_use', 'digital_stress_score', 
            'screens_before_sleep_score', 'stress_negative_affect', 'pressure_perfectionism', 
            'social_support_score', 'isolation_score', 'self_criticism_score', 
            'low_resilience_score', 'age', 'education_level', 'employment', 
            'study_hours', 'sleep_hours', 'online_hours', 'academic_gpa', 
            'gender_Feminin', 'gender_Masculin', 'gender_Prefer să nu răspund'
        ]
        
        data_dict = {
            'interest_motivation': interest_motivation,
            'satisfaction_recognition': satisfaction_recognition,
            'procrastination_score': procrastination_score,
            'organization_score': organization_score,
            'sleep_quality_score': sleep_quality_score,
            'sleep_difficulty_score': sleep_difficulty_score,
            'balanced_lifestyle_score': balanced_lifestyle_score,
            'stimulant_use': stimulant_use,
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
            'online_hours': online_hours,
            'academic_gpa': academic_gpa,
            'gender_Feminin': gender_Feminin,
            'gender_Masculin': gender_Masculin,
            'gender_Prefer să nu răspund': gender_Prefer_sa_nu_raspund
        }

        df_pred = pd.DataFrame([data_dict], columns=feature_names)

        X_scaled = scaler.transform(df_pred)
        prediction_encoded = xgb_model.predict(X_scaled)
        
        final_cluster = label_encoder.inverse_transform(prediction_encoded)[0]

        test_result = TestResult.objects.create(
            student=profile,
            responses=responses,
            predicted_cluster=final_cluster
        )

        return Response({
            "message": "Test finalizat cu succes!",
            "predicted_cluster": final_cluster
        }, status=status.HTTP_201_CREATED)