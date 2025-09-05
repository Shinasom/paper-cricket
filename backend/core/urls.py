# backend/core/urls.py

from django.contrib import admin
from django.urls import path, include # <-- Make sure to add 'include'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', include('game.urls')), # <-- Add this line
]