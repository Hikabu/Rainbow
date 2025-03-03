from rest_framework import serializers
from django.contrib.auth import get_user_model
# from intrauth.models import Profile
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')  # Extract the password from the input data
        user = User(**validated_data)  # Create a user instance without saving yet
        user.set_password(password)  # Hash the password
        user.save()
        return user
    
# class ProfileSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username', read_only=True)
#     email = serializers.EmailField(source='user.email', read_only=True)
#     is_online = serializers.BooleanField(source='user.is_online', read_only=True)

#     class Meta:
#         model = Profile
#         fields = ['id', 'username', 'email', 'is_online', 'avatar', 'wins', 'losses', 'friends']
#         read_only_fields = ['id', 'username', 'email', 'is_online']
        
class OTPRequestSerializer(serializers.Serializer):
	username = serializers.CharField()

class OTPVerifySerializer(serializers.Serializer):
	username = serializers.CharField()
	otp = serializers.CharField()