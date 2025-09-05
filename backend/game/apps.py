# backend/game/apps.py

from django.apps import AppConfig

class GameConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game'

    def ready(self):
        # This line imports and connects our signals when the app is ready.
        import game.signals