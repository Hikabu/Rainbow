from rest_framework import serializers
from project.apps.intrauth.models import Profile, GameResult
from django.contrib.auth import get_user_model
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta: #change the behavior of model 
        model = User#whom to srlz
        fields = ['id', 'username', 'email', 'password', 'intra_login', 'intra_avatar']#json
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')  # Extract the password from the input data
        user = User(**validated_data)  # Create a user instance without saving yet
        user.set_password(password)  # Hash the password
        user.save()
        return user
   
class GameSerializer(serializers.ModelSerializer):
    game_type = serializers.CharField()
    user = serializers.SlugRelatedField(slug_field = 'username', read_only= True)
    player2 = serializers.SlugRelatedField(slug_field = 'username', read_only= True, allow_null=True)
    # start_time = serializers.CharField()

    class Meta:
        model = GameResult
        fields = ['user', 'user_score', 'user_result', 'game_id', 'game_type', 'player2_alias', 'player2_result', 'player2_score',  'start_time', 'player2']

    def update(self, instance, validated_data):
        instance.user_result = validated_data.get("user_result", instance.user_result)
        instance.user_score = validated_data.get("user_score", instance.uder_score)
        instance.player2_alias = validated_data.get("player2_alias", instance.player2_alias)
        instance.player2_result = validated_data.get("player2_result", instance.player2_result)
        instance.player2_score = validated_data.get("player2_score", instance.player2_score)
        instance.game_type = validated_data.get("game_type", instance.game_type)
        instance.start_time = validated_data.get("start_time", instance.start_time)
        if 'user' in validated_data:
            instance.user = validated_data['user']
        instance.save()
        return instance
class FriendSerializer(serializers.ModelSerializer):
    isOnline = serializers.BooleanField(source ='is_online')
    username = serializers.CharField(source='user.username')
    intraLogin = serializers.CharField(source='user.intra_login')
    id = serializers.IntegerField()
    class Meta:
        model = Profile
        fields = ['id', 'isOnline', 'username', 'intraLogin']
class ProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True) #for id 
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    intraLogin = serializers.CharField(source='user.intra_login')
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
            'id', 'username', 'email', 'displayName', 'isOnline', 'intraLogin', 'intra_avatar',
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