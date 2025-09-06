# backend/game/middleware.py
import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware

@database_sync_to_async
def get_user_from_token(token):
    """
    Asynchronously gets a user from a JWT access token.
    """
    print(f"\n[Middleware] Trying to authenticate with token: {token}")
    try:
        # Decode the token to get the user ID
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')

        if user_id is None:
            print("[Middleware] FAILURE: Token payload does not contain user_id.")
            return AnonymousUser()
        
        # Lazy import of User model
        User = get_user_model()

        # Find the user in the database
        user = User.objects.get(id=user_id)
        print(f"[Middleware] SUCCESS: Found user '{user.username}'")
        return user

    except jwt.ExpiredSignatureError:
        print("[Middleware] FAILURE: Token has expired.")
        return AnonymousUser()
    except (jwt.InvalidTokenError, User.DoesNotExist) as e:
        print(f"[Middleware] FAILURE: Invalid token or user not found. Reason: {e}")
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate a user from a JWT token
    passed in the query string of a WebSocket connection.
    """
    async def __call__(self, scope, receive, send):
        # The query string is parsed by Daphne into a byte string.
        query_string = scope.get('query_string', b'').decode('utf-8')
        
        # Parse the token from the query string (e.g., "?token=...")
        token = None
        if "token=" in query_string:
            token = query_string.split('token=')[1].split('&')[0]

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
            print("\n[Middleware] No token found in WebSocket query string.")

        # Continue processing the connection with the user attached to the scope
        return await super().__call__(scope, receive, send)
