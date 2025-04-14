from django.contrib.auth import models

class IntraUserManager(models.UserManager):
    def create_new_intra_user(self, user):
        print("inside creating new user")
        new_user = self.create(
            intra_id=user['id'],# to rise errorkey error 
            intra_login=user['login'],
            email=user.get('email'),# dont care about key 
            intra_avatar=user.get('image', {}).get('link', '')
        )
        print("New user created:", new_user)
        return new_user