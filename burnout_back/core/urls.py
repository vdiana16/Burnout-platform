from django.urls import path
from .views.authView import RegisterView, InstitutionListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('institutions/', InstitutionListView.as_view(), name='institution_list'),
]