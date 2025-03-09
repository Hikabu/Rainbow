from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from .models import CustomUser

User = get_user_model()

class IntraAuthenticationBackend(BaseBackend):
    def authenticate(self, request, user) -> CustomUser:
        print("Received user data:", user)
        if not user or 'id' not in user:
            print("Invalid user data: Missing 'id'")
            return None
        #user exists in the database
        try:
            user_found = CustomUser.objects.get(intra_id=user['id'])
            user_found.backend = 'project.apps.intrauth.auth.IntraAuthenticationBackend'
            # print(f"Existing user found: {user_found}")
            return user_found
        except CustomUser.DoesNotExist:
            print("Creating new user")
            try:
                new_user = CustomUser.objects.create_new_intra_user(user)
                new_user.backend = 'project.apps.intrauth.auth.IntraAuthenticationBackend'
                # print(f"New user created: {new_user}")
                return new_user
            except Exception as e:
                print(f"Failed to create new user: {e}")
                return None
    
    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None