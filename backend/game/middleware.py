# backend/game/middleware.py
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(session_key):
    print(f"\n[Middleware] Trying to authenticate with session key: {session_key}")
    try:
        session = Session.objects.get(session_key=session_key)
        session_data = session.get_decoded()
        user_id = session_data.get('_auth_user_id')
        user = User.objects.get(id=user_id)
        print(f"[Middleware] SUCCESS: Found user '{user.username}'")
        return user
    except (Session.DoesNotExist, User.DoesNotExist, KeyError) as e:
        print(f"[Middleware] FAILURE: Could not find user. Reason: {e}")
        return AnonymousUser()

class CookieAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # The session key is stored in the cookies from the connection headers
        session_key = scope.get('cookies', {}).get('sessionid')
        if session_key:
            scope['user'] = await get_user(session_key)
        else:
            scope['user'] = AnonymousUser()
            print("\n[Middleware] No sessionid cookie found in WebSocket connection.")

        return await self.app(scope, receive, send)

