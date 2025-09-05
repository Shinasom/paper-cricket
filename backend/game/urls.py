# backend/game/urls.py

from django.urls import path
# Import the new LoginView
from .views import CreateMatchView, JoinMatchView, RegisterView, LoginView, UserDetailView

urlpatterns = [
    path('matches/create/', CreateMatchView.as_view(), name='create-match'),
    path('matches/join/', JoinMatchView.as_view(), name='join-match'),
    
    path('auth/register/', RegisterView.as_view(), name='register'),
    # Add this new line for the login endpoint
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', UserDetailView.as_view(), name='user-detail'),
]