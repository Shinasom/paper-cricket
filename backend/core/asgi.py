# backend/core/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

# Set the default settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Initialize Django applications first
django_asgi_app = get_asgi_application()

# Import Channels middleware and routing after Django apps are ready
from game.middleware import JWTAuthMiddleware
import game.routing

# Define ASGI application with HTTP and WebSocket support
application = ProtocolTypeRouter({
    # HTTP requests are handled by standard Django ASGI app
    "http": django_asgi_app,

    # WebSocket requests use our custom JWTAuthMiddleware wrapped around the router
    "websocket": JWTAuthMiddleware(
        URLRouter(
            game.routing.websocket_urlpatterns
        )
    ),
})
