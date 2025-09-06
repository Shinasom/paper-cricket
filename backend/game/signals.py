# backend/game/signals.py

from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Player

@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    """
    Signal receiver that creates a Player profile automatically
    whenever a new User is created.
    """
    if created:
        Player.objects.create(username=instance.username)
        print(f"Player profile created for user {instance.username}")