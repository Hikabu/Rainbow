#API views in DRF
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated #permissiom classes 
from rest_framework.response import Response #return data from api
from rest_framework import status #result of requests
from rest_framework import viewsets#for rrouting make views in single calss
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
#for env
import os
from django.contrib.auth import get_user_model #currently active user model in project
#custom serializers 
from .serializer import UserSerializer,  OTPRequestSerializer, OTPVerifySerializer, ProfileSerializer, FriendSerializer, GameSerializer
#otp verification
import pyotp
import resend #sed emails
import requests #interact with api
from django.core.cache import cache #to not use db 
from project.apps.intrauth.models import Profile, GameResult #additional userelated information
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny# unrestricted access to a view/endpoint

from rest_framework.decorators import action
from django.contrib.auth import authenticate #if its exists
from rest_framework.throttling import AnonRateThrottle # no brutforce
from django.conf import settings #taking jwt configs
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


# User = settings.AUTH_USER_MODEL

from django.conf import settings
User = get_user_model()
     
###registration
class UserCreateView(APIView):
    authentication_classes = []  # disable authentication
    permission_classes = []  
    def get(self, request): # define endpoint function if i need info
        # return Response(UserSerializer(request.user).data)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class UserVerify(APIView):
	authentication_classes = []  # Allow unauthenticated access
	permission_classes = []
	throttle_classes = [AnonRateThrottle]
  
	def post(self, request):
		username = request.data.get('username')
		password = request.data.get('password')
		user = authenticate(username=username, password=password)
		
		if not user:
			return Response({'error': 'Invalid credentials'}, status=401)
		return Response({'message': 'Good job, you are not invalid'}, status=200)

###OTP creation    
    
resend = os.environ.get('RESEND') 

def generate_otp():
    totp = pyotp.TOTP(pyotp.random_base32(), interval=300)  # 5 minutes validity
    return totp.now()
def send_email(email, otp):
	url = 'https://api.resend.com/emails'
	headers = {
		'Authorization': f'Bearer {resend}',
		'Content-Type': 'application/json'
	}
	data = {
		"from": "onboarding <noreply@birgabon.me>",
		"to": [email],
		"subject": "Use it smartly",
		"html": f"<p>Dont loose it {otp}. We will never send it again</p>"
	}
	try:
		response = requests.post(url, headers=headers, json=data)
		if response.status_code == 200:
			print('Email sent successfully')
		else:
			print(f'Failed to send email: {response.status_code}')
			print(response.text)
	except Exception as e:
		print(f'Error sending email: {str(e)}')
       
class GetOTPView(APIView):
	authentication_classes = []  # Allow unauthenticated access
	permission_classes = []
	throttle_classes = [AnonRateThrottle]
	def post(self, request):
		serializer = OTPRequestSerializer(data=request.data)
		if serializer.is_valid():
			username = serializer.validated_data['username']
			try:
				user = User.objects.get(username=username)
				otp = generate_otp()
				cache.set(f'otp_{username}', otp, timeout=300)  # save for 5 min in cashe
				send_email(user.email, otp)
				return Response({'otp': otp}, status=status.HTTP_200_OK)
				# return Response({'message': 'OTP sent if user exists'}, status=status.HTTP_200_OK)
			except User.DoesNotExist:
				return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
	authentication_classes = []  # Allow unauthenticated access
	permission_classes = []
	throttle_classes = [AnonRateThrottle]
	def post(self, request):
		serializer = OTPVerifySerializer(data=request.data)
		if serializer.is_valid():
			username = serializer.validated_data['username']
			received_otp = serializer.validated_data['otp']
			stored_otp = cache.get(f'otp_{username}')
			if stored_otp and received_otp == stored_otp:
				cache.delete(f'otp_{username}')
				return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
			return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

"""
  ModelViewSet provided by DRF.
 It automatically provides CRUD operations
  (Create, Retrieve, Update, Delete) for the Profile model.
"""


#frineds autofill search 
'''
usr types in Vue input field
ue watches searchQuery and calls the debounced function
vue makes a GET request to /api/profiles/search/?query=...
django view receives it, runs ORM query on Profile model
results are serialized and sent back to Vue
vue updates the UI with results
'''
class FriendsViewSet(viewsets.ModelViewSet):
	permission_classes = [IsAuthenticated] 
	queryset = Profile.objects.all()
	serializer_class = ProfileSerializer
	@action(detail=False, methods=['get'], url_path='search')
	def search(self, request):
		query = request.query_params.get('query', '').strip() #strip for overfetching
		if not query:
			return Response([])
		#databSE filtering
		profiles = Profile.objects.filter(
			Q(user__username__icontains=query) |
			Q(user__intra_login__icontains=query)# kind if contaner for or 

		).exclude(user=request.user)[:10]#limit queryset

		serializer = FriendSerializer(profiles, many=True)
		return Response(serializer.data)

class ResultsViewSet(viewsets.ModelViewSet):
	permission_classes = [IsAuthenticated]
	queryset = GameResult.objects.all()
	serializer_class = GameSerializer
	ordering = ['-start_time'] #new

	def get_queryset(self):
		# return GameResult.objects.filter(user = self.request.user).order_by('-start_time')
		return GameResult.objects.filter(
			Q(user=self.request.user) | 
			Q(player2=self.request.user)
		).order_by('-start_time')
	@action(detail=False, methods=['get'])
	def result(self, request):
		queryset = self.get_queryset()
		serializer = GameSerializer(queryset, many=True)
		return Response(serializer.data)
	# def result(self, request):
	# 	user = request.user
	# 	games = GameResult.objects.filter(user=user).order_by("-start_time")
	# 	serilaizer = GameSerializer(games, many=True)
	# 	return Response(serializer.data)
class ProfileViewSet(viewsets.ModelViewSet):
    #this api read write
    #view list automatica;;y provides list create retrieve update destroy actions
    #list will return a collection if user objects
    #retrieve requests a pecific user endpoint=details of a single user
	permission_classes = [IsAuthenticated] #remove after postman 
	queryset = Profile.objects.all()
	serializer_class = ProfileSerializer
     
	@action(detail=False, methods=['get' ,'patch'])
	def me(self, request): #without drf will return whole list and front to stipid to understand what to take
		checkprofile = self.get_queryset().first()
		if not checkprofile:
			return Response({"detail:", "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
		if request.method == 'GET':
			serializer = self.get_serializer(checkprofile)
			return Response(serializer.data)
		elif request.method == 'PATCH':
			serializer = self.get_serializer(checkprofile, data=request.data, partial=True)
			serializer.is_valid(raise_exception=True)
			self.perform_update(serializer)
			return Response(serializer.data)
	def get_queryset(self):
		return Profile.objects.filter(user=self.request.user)
	def perform_update(self, serializer):
        # users can only update their own profile
		serializer.save(user=self.request.user)
 
 
class AuthStatusView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this endpoint
    def get(self, request):
        return Response({'isAuthenticated': True}, status=200)
    
    
class UserLogOutView(APIView):
	def post(self, request):
		try:
			refresh_token = request.COOKIES.get('refresh_token')
			if refresh_token :
				token =RefreshToken(refresh_token)
				token.blacklist()
		except TokenError as e:
			#token invalid or expired so just pass
			pass
		#delete cookies to set then to expire right now
		response = Response(
			{"detail:" "Succesfully logout"},
			status=status.HTTP_200_OK
		)

		response.delete_cookie(
			'access_token',
			path='/'
		)
		response.delete_cookie(
			'refresh_token',
			path='/',
		)
		return response

class MyTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs ): #capturing any additional arguments that the parent post method might need
		response = super().post(request, *args, **kwargs)
		if response.status_code == 200:
			access_token = response.data.get('access')
			refresh_token = response.data.get('refresh')

			response.set_cookie(
				'access_token',
				access_token,
				httponly=True,
				secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
				samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
				max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
			)
   
			response.set_cookie(
				'refresh_token',
				refresh_token,
				httponly=True,
				secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
				samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
				max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
			)
			#remove from response body
			del response.data['access']
			del response.data['refresh']
		return response

class MyTokenRefreshView(TokenRefreshView):
	def post(self, request, *args, **kwargs):
		#self should call exacly token refresh serializer so create new one
		#recive from ccokies for validation
		print("Incoming Cookies:", request.COOKIES)  # Debugging
		refresh_token = request.COOKIES.get('refresh_token') #structure wit the cookies 
		if not refresh_token:
			return Response({'error': 'Refresh token is missing'}, status=401)
		print ("Refresh token:", refresh_token)
		#get new refrech token too because of rotation security
		data = {'refresh': refresh_token}
		print ("data is:", data)
		serializer = self.get_serializer(data=data) #serializer data will take the parametr 
		try: 
			serializer.is_valid(raise_exception=True) # expired or blacklisted 
		except TokenError as e:
			return Response ({'error': str(e)}, status=401)
   
		new_access_token = serializer.validated_data['access'] #shure that access token exists
		new_refresh_token = serializer.validated_data.get('refresh') # if not can return none
   
		response = Response({'message': 'Tokens refreshed'})
  
		response.set_cookie(
			'access_token',
			new_access_token,
			httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
			secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
			samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
			max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
		)

		if 'refresh' in serializer.validated_data:
			response.set_cookie(
			'refresh_token',
			new_refresh_token,
			httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
			secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
			samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
			max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
		)
		if 'access' in response.data:
			del response.data['access']
		if 'refresh' in response.data:
			del response.data['refresh']
		return response

    

    
    
 