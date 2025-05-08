from django.urls import path, include
from django.contrib.auth import views as auth_views
from .views import (
    custom_login, 
    user_profile, 
    video_generator, 
    upload_profile_image, 
    dashboard,
    signup,
    verify_email,
    resend_verification,
    CustomPasswordResetView,
    CustomPasswordResetDoneView,
    CustomPasswordResetConfirmView,
    CustomPasswordResetCompleteView,
    connect_telegram
)

urlpatterns = [
    path('login/', custom_login, name="login"),
    path('signup/', signup, name="signup"),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('social-auth/', include('social_django.urls', namespace='social')),
    path('dashboard/', dashboard, name="dashboard"),
    path('profile/', user_profile, name="profile"),
    path('video_generator/', video_generator, name="video_generator"),
    path('upload_profile_image/', upload_profile_image, name="upload_profile_image"),
    
    # Email verification
    path('verify-email/<uuid:token>/', verify_email, name='verify_email'),
    path('resend-verification/', resend_verification, name='resend_verification'),
    
    # Password reset
    path('password_reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('connect-telegram/', connect_telegram, name='connect_telegram'),
]
