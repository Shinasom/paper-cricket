# backend/game/admin.py

from django.contrib import admin
from .models import Player, Match, Inning, Ball

# Register your models here to make them visible in the admin site.
admin.site.register(Player)
admin.site.register(Match)
admin.site.register(Inning)
admin.site.register(Ball)