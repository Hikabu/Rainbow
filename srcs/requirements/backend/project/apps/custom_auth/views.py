#API views in DRF
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated #permissiom classes 
from rest_framework.response import Response #return data from api
from rest_framework import status #result of requests
from rest_framework import viewsets#for rrouting make views in single calss
#for env
import os
from django.contrib.auth import get_user_model #currently active user model in project
#custom serializers 
from .serializer import UserSerializer,  OTPRequestSerializer, OTPVerifySerializer, ProfileSerializer
#otp verification
import pyotp
import resend #sed emails
import requests #interact with api
from django.core.cache import cache #to not use db 
from project.apps.intrauth.models import Profile #additional userelated information
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny# unrestricted access to a view/endpoint

from django.contrib.auth import authenticate #if its exists
from rest_framework.throttling import AnonRateThrottle # no brutforce

import logging
logger = logging.getLogger(__name__)

    


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
	# throttle_classes = [AnonRateThrottle]
  
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
	# throttle_classes = [AnonRateThrottle]
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
class ProfileViewSet(viewsets.ModelViewSet):
    #this api read write
    #view list automatica;;y provides list create retrieve update destroy actions
    #list will return a collection if user objects
    #retrieve requests a pecific user endpoint=details of a single user
	permission_classes = [AllowAny] #remove after postman 
	queryset = Profile.objects.all()
	serializer_class = ProfileSerializer
	def get_queryset(self):
		return Profile.objects.filter(user=self.request.user)
	def perform_update(self, serializer):
        # users can only update their own profile
		serializer.save(user=self.request.user)
 
 
class AuthStatusView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this endpoint
    def get(self, request):
        return Response({'isAuthenticated': True})
    
    
class LogoutView(APIView):
    def post(self, request):
        response = Response({'message': 'logged out'})
        response.delete_cookie('refresh_token') #refresh token
        return response

# class MyTokenObtinPairView(TokenObtainPairView):
#     def post(*arg, **kwargs, ): #capturing any additional arguments that the parent post method might need
