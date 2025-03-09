from django.db import models
from .managers import IntraUserManager
from django.apps import apps
from django.contrib.auth.models import AbstractUser
from django.conf import settings
    
"""
each model class corresponds to a single database table.  

CustomUser :  provides default fields for user authentication 
    (tipa username, email, password). By extending AbstractUser, 
    we can add additional fields such as intra_id, intra_login,
    intra_avatar, is_online, friends, and display_name - can be modified 
    name wil be "appname_customuser"-> intrauth_customuser

Profile Table : store profile-related data, including fields like 
"""    
class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # Links to the CustomUser model(can be changed- so direct link to the model)
        on_delete=models.CASCADE,  #profile deleted link delets too
        related_name='profile'     #accrss profile like user.profile
        )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    friends = models.ManyToManyField('self', blank=True)

class CustomUser(AbstractUser):
    # Traditional
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True, blank=True, null=True)  # Optional
    password = models.CharField(max_length=128, blank=True, null=True)  # Nullable for OAuth users

    #  42 Intra
    objects = IntraUserManager()
    intra_id = models.BigIntegerField(unique=True, blank=True, null=True)
    intra_login = models.CharField(max_length=8, unique=True, blank=True, null=True)
    intra_avatar = models.URLField(max_length=200, blank=True, null=True)

    # Additional fields (common to all users)
    is_online = models.BooleanField(default=False)
    friends = models.JSONField(default=list, blank=True)
    display_name = models.CharField(max_length=100, null=True, blank=True)

    # name as the primary identifier
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = [] 

def is_authenticated(self, request):
    return True