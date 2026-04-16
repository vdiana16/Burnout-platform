from django.urls import path
from .views.authView import RegisterView, InstitutionListView
from .views.testsView import QuestionListView, SubmitTestView, ResultsView
from .views.profilesView import StudentProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('institutions/', InstitutionListView.as_view(), name='institution_list'),
    path('questions/', QuestionListView.as_view(), name='questions-list'),
    path('test-submit/', SubmitTestView.as_view(), name='test-submit'),
    path('student/profile/', StudentProfileView.as_view(), name='student-profile'),
    path('my-results/', ResultsView.as_view(), name='my-results'),
]