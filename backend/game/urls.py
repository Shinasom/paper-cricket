# backend/game/urls.py

from django.urls import path
# Import the views that are actually in our views.py file
from .views import (
    CreateMatchView, JoinMatchView, 
    RegisterView, UserDetailView
)
# Import the JWT token views from the library
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Match URLs
    path('matches/create/', CreateMatchView.as_view(), name='create-match'),
    path('matches/join/', JoinMatchView.as_view(), name='join-match'),
    
    # Auth URLs
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/user/', UserDetailView.as_view(), name='user-detail'),
    
    # JWT Token URLs
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

