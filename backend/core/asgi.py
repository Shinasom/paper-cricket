# backend/core/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack # <-- Import SessionMiddlewareStack

from game.middleware import CookieAuthMiddleware
import game.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Get the default Django ASGI application to handle HTTP requests.
django_asgi_app = get_asgi_application()

# This is the final, robust structure.
application = ProtocolTypeRouter({
    # For HTTP requests, we use the standard Django application.
    "http": django_asgi_app,

    # For WebSocket requests, we apply a stack of middleware.
    # The connection flows from the outside in:
    # 1. SessionMiddlewareStack: Handles Django's session logic.
    # 2. CookieAuthMiddleware: Uses the session to find the user.
    # 3. URLRouter: Routes the connection to our GameConsumer.
    "websocket": SessionMiddlewareStack(
        CookieAuthMiddleware(
            URLRouter(
                game.routing.websocket_urlpatterns
            )
        )
    ),
})

