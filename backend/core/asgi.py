# backend/core/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

# Import our new JWT middleware
from game.middleware import JWTAuthMiddleware

import game.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # For HTTP requests, we use the standard Django application.
    "http": django_asgi_app,

    # For WebSocket requests, we now wrap the router with our new JWTAuthMiddleware.
    # This is much simpler than the previous session-based stack.
    "websocket": JWTAuthMiddleware(
        URLRouter(
            game.routing.websocket_urlpatterns
        )
    ),
})

