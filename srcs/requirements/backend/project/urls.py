from django.http import HttpResponse
from django.contrib import admin
from django.urls import path, include

# tokens
from project.apps.custom_auth.views import UserCreateView, GetOTPView, VerifyOTPView, AuthStatusView, ProfileViewSet, UserVerify, MyTokenObtainPairView, MyTokenRefreshView, UserLogOutView, FriendsViewSet, ResultsViewSet
from project.apps.intrauth.views import home, intra_login, intra_login_redirect, get_authenticated_user
from project.apps.game.registration import take_ipfs_cids
from project.apps.game import consumers

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'friends', FriendsViewSet, basename='friends')
router.register(r'results', ResultsViewSet, basename='results')


def home(request):
    return HttpResponse("Hello, Django is running!")


urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path('api/', include(router.urls)),
    
    path('auth/user/', get_authenticated_user, name='get_authenticated_user'),
    path('oauth/', home, name='oauth'),
    path('oauth/login/', intra_login, name='oauth_login'),
    path('oauth/redirect/', intra_login_redirect, name='oauth_login_redirect'),
    
     # Custom auth endpoints
    path('api/signup/', UserCreateView.as_view(), name='signup'),
    path('api/logout/', UserLogOutView.as_view(), name='signup'),
    path('api/isuser/', UserVerify.as_view(), name='isuser'),
    path('api/auth-status/', AuthStatusView.as_view(), name='auth-status'),
    path('api/token/', (MyTokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('api/token/refresh/',(MyTokenRefreshView.as_view()), name='token_refresh'),  
    path('api/get-otp/', GetOTPView.as_view(), name='get_otp'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('api/get-cids/', take_ipfs_cids, name='cid'),

	#game
]

ws_urlpatterns = [
	path("ws/<str:user_id>/", consumers.MainConsumer.as_asgi()),
]
