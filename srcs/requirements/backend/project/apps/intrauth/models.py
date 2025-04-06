from django.db import models
from .managers import IntraUserManager
from django.apps import apps
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from storages.backends.s3 import S3File
from storages.backends.s3boto3 import S3Boto3Storage
from uuid import uuid4
# from django.contrib.auth import get_user_model
# User = get_user_model()
from django.conf import settings
User = settings.AUTH_USER_MODEL
"""
each model class corresponds to a single database table.  

CustomUser :  provides default fields for user authentication 
    (tipa username, email, password). By extending AbstractUser, 
    we can add additional fields such as intra_id, intra_login,
    intra_avatar, is_online, friends, and display_name - can be modified 
    name wil be "appname_customuser"-> intrauth_customuser

Profile Table : store profile-related data, including fields like 


uuid for aws for not rewroteogn files with same names 
avoid special character issues in filenames and 
make URLs harder to guess (basic security)
"""    

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    
def get_avatar_s3_path(instance: "Profile", filename: str):
    return f"{uuid4().hex}.{filename.split(".")[-1]}"

class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # Links to the CustomUser model(can be changed- so direct link to the model)
        on_delete=models.CASCADE,  #profile deleted link delets too
        related_name='profile'     #accrss profile like user.profile
        )
    avatar = models.ImageField(
        storage=MediaStorage(),
        upload_to='avatars/',
        blank=True, 
        null=True)
    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    friends = models.ManyToManyField('self', blank=True)
    display_name = models.CharField(max_length=100, null=True, blank=True)
    is_online = models.BooleanField(default=False)
    
    # def __str__(self):
    #     return self.username or self.email  #string representation of class(like print but print will show mem.address)
    @property
    def email(self):
        return self.user.email
    def __str__(self):
        # Use display_name if set, fallback to user's username/email
        if self.display_name:
            return self.display_name
        return f"Profile for {self.user.username}"  # Ensure this path returns a strin
    def open(self) ->S3File:
        storage = MediaStorage()
        return storage.open(self.file.name, mode="rb")

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

    # name as the primary identifier
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = [] 
    
    def __str__(self):
        return self.username or self.email  #string representation of class(like print but print will show mem.address)

def is_authenticated(self, request):
    return True