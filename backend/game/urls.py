# backend/game/urls.py

from django.urls import path
# Import the new view
from .views import CreateMatchView, JoinMatchView

urlpatterns = [
    path('matches/create/', CreateMatchView.as_view(), name='create-match'),
    # Add this new line for the join endpoint
    path('matches/join/', JoinMatchView.as_view(), name='join-match'),
]