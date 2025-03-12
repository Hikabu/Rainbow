from rest_framework import serializers
from django.contrib.auth import get_user_model
from project.apps.intrauth.models import Profile
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
        
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    display_name = serializers.CharField()
    is_online = serializers.BooleanField()

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'display_name', 'is_online',
            'avatar', 'wins', 'losses', 'friends'
        ]
        read_only_fields = ['id', 'username', 'email']

    def update(self, instance, validated_data):
        # Update display_name and is_online directly in Profile
        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.is_online = validated_data.get('is_online', instance.is_online)
        instance.save()
        return instance
    
class OTPRequestSerializer(serializers.Serializer):
	username = serializers.CharField()

class OTPVerifySerializer(serializers.Serializer):
	username = serializers.CharField()
	otp = serializers.CharField()