from django.contrib import admin

from .models import CustomUser, Profile

admin.site.register(CustomUser)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name','email', 'wins', 'losses', 'email')
    
    # def user_email(self, obj): # this, and many isers from prifile
    #     return obj.user.email # one to one link
    # user_email.short_description = 'Email'
    