from django.contrib.auth.backends import BaseBackend
from .models import CustomUser
# from django.contrib.auth import get_user_model
# User = get_user_model()
from django.conf import settings
User = settings.AUTH_USER_MODEL

class IntraAuthenticationBackend(BaseBackend):
    def authenticate(self, request, user) -> CustomUser:
        if not user or 'id' not in user:
            return None
        #user exists in the database
        try:
            user_found = CustomUser.objects.get(intra_id=user['id'])
            user_found.backend = 'project.apps.intrauth.auth.IntraAuthenticationBackend'
            return user_found
        except CustomUser.DoesNotExist:
            try:
                new_user = CustomUser.objects.create_new_intra_user(user)
                new_user.backend = 'project.apps.intrauth.auth.IntraAuthenticationBackend'
                return new_user
            except Exception as e:
                return None
    
    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None