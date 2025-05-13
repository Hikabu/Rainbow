from django.contrib import admin

from .models import CustomUser, Profile, GameResult

admin.site.register(CustomUser)

@admin.register(Profile)#editable by admin
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name','email', 'wins', 'losses', 'email')

@admin.register(GameResult)#editable by admin
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_score', 'user_result', 'game_id', 'game_type', 'player2_alias', 'player2_result', 'player2_score',  'start_time')
    # def user_email(self, obj): # this, and many isers from prifile
    #     return obj.user.email # one to one link
    # user_email.short_description = 'Email'
    