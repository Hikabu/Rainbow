from rest_framework import serializers
from project.apps.intrauth.models import Profile
from django.contrib.auth import get_user_model
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta: #change the behavior of model 
        model = User
        fields = ['id', 'username', 'email', 'password', 'intra_login', 'intra_avatar']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')  # Extract the password from the input data
        user = User(**validated_data)  # Create a user instance without saving yet
        user.set_password(password)  # Hash the password
        user.save()
        return user
       
class FriendSerializer(serializers.ModelSerializer):
    isOnline = serializers.BooleanField(source ='is_online')
    username = serializers.CharField(source='user.username')
    id = serializers.IntegerField()
    class Meta:
        model = Profile
        fields = ['id', 'isOnline', 'username']
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    intra_login = serializers.CharField(source='user.intra_login')
    intra_avatar = serializers.URLField(source='user.intra_avatar')
    displayName = serializers.CharField(source='display_name') #for frintend camel 
    isOnline = serializers.BooleanField(source='is_online')
    avatar = serializers.ImageField(use_url = True)
    friends = FriendSerializer(many=True, read_only=True) #nested so not writable by drf(expects queryset not json)
    friendsQueryset = serializers.PrimaryKeyRelatedField(
        source='friends_queryset',
        queryset=Profile.objects.all(),
        many=True,
        write_only=True
    )

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'displayName', 'isOnline', 'intra_login', 'intra_avatar',
            'avatar', 'wins', 'losses', 'friends', 'friendsQueryset'
        ]
        read_only_fields = ['id', 'username', 'email']

    def update(self, instance, validated_data):
        # Update display_name and is_online directly in Profile
        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.is_online = validated_data.get('is_online', instance.is_online)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        if 'friends_queryset' in validated_data:
            instance.friends.set(validated_data['friends_queryset'])
        instance.save()
        return instance
    
class OTPRequestSerializer(serializers.Serializer):
    username = serializers.CharField()

class OTPVerifySerializer(serializers.Serializer):
	username = serializers.CharField()
	otp = serializers.CharField()