from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import UserInfo, GeneraterVideImage, EmailVerificationToken
from django.conf import settings
from django.http import JsonResponse
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.urls import reverse
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.views import (
    PasswordResetView,
    PasswordResetDoneView,
    PasswordResetConfirmView,
    PasswordResetCompleteView
)


# Create your views here.


def signup(request):
    """Handle user signup with email verification"""
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        # Validate input
        if not all([username, email, password, confirm_password]):
            return render(request, 'signup.html', {'error_message': 'All fields are required'})
            
        if password != confirm_password:
            return render(request, 'signup.html', {'error_message': 'Passwords do not match'})
            
        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return render(request, 'signup.html', {'error_message': 'Username already exists'})
            
        if User.objects.filter(email=email).exists():
            return render(request, 'signup.html', {'error_message': 'Email already exists'})
            
        # Create inactive user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=False  # User will be activated after email verification
        )
        
        # Create user info
        UserInfo.objects.create(
            user=user,
            user_email=email,
            subscription_status='free'
        )
        
        # Generate verification token
        token = EmailVerificationToken.objects.create(user=user)
        
        # Send verification email
        verification_url = request.build_absolute_uri(
            reverse('verify_email', kwargs={'token': token.token})
        )
        
        email_subject = "Verify Your Email - ReelsBuilder"
        email_body = render_to_string('email/verify_email.html', {
            'user': user,
            'verification_url': verification_url,
        })
        
        plain_message = strip_tags(email_body)
        
        # Send email
        send_mail(
            email_subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=email_body,
            fail_silently=False,
        )
        
        # Redirect to verification sent page
        return render(request, 'verify_email_pages.html', {
            'title': 'Email Verification Sent',
            'email': email,
            'sent': True
        })
        
    return render(request, 'signup.html')


def verify_email(request, token):
    """Verify user email with token"""
    try:
        verification_token = EmailVerificationToken.objects.get(token=token)
        
        if not verification_token.is_valid:
            # Token expired
            return render(request, 'verify_email_pages.html', {
                'title': 'Email Verification Failed',
                'error': True
            })
        
        # Activate user
        user = verification_token.user
        user.is_active = True
        user.save()
        
        # Mark email as verified in UserInfo
        user_info = UserInfo.objects.get(user=user)
        user_info.is_email_verified = True
        user_info.save()
        
        # Create user directories
        user_info.create_user_directories()
        
        # Delete token
        verification_token.delete()
        
        return render(request, 'verify_email_pages.html', {
            'title': 'Email Verified Successfully',
            'success': True
        })
    except EmailVerificationToken.DoesNotExist:
        return render(request, 'verify_email_pages.html', {
            'title': 'Email Verification Failed',
            'error': True
        })


def resend_verification(request):
    """Resend verification email"""
    if request.method == 'POST':
        email = request.POST.get('email')
        
        try:
            user = User.objects.get(email=email, is_active=False)
            
            # Delete existing token if any
            EmailVerificationToken.objects.filter(user=user).delete()
            
            # Create new token
            token = EmailVerificationToken.objects.create(user=user)
            
            # Send verification email
            verification_url = request.build_absolute_uri(
                reverse('verify_email', kwargs={'token': token.token})
            )
            
            email_subject = "Verify Your Email - ReelsBuilder"
            email_body = render_to_string('email/verify_email.html', {
                'user': user,
                'verification_url': verification_url,
            })
            
            plain_message = strip_tags(email_body)
            
            # Send email
            send_mail(
                email_subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=email_body,
                fail_silently=False,
            )
            
            return render(request, 'verify_email_pages.html', {
                'title': 'Email Verification Sent',
                'email': email,
                'sent': True
            })
            
        except User.DoesNotExist:
            pass
            
    # Always redirect to verification sent page to prevent email enumeration
    return render(request, 'verify_email_pages.html', {
        'title': 'Email Verification Sent',
        'email': request.POST.get('email', ''),
        'sent': True
    })


def custom_login(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == "POST":
        username_or_email = request.POST.get("name")
        password = request.POST.get("pass")
        
        # Try to authenticate with username
        user = authenticate(request, username=username_or_email, password=password)
        
        if user is None:
            # Try to authenticate with email
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is not None:
            # Check if email is verified
            try:
                user_info = UserInfo.objects.get(user=user)
                if not user.is_active:
                    # Re-send verification email if user is not active
                    return render(request, "verify_email_pages.html", {
                        "title": "Email Verification Required",
                        "email": user.email,
                        "sent": True
                    })
                    
                login(request, user, backend="django.contrib.auth.backends.ModelBackend")
                return redirect('dashboard')
            except UserInfo.DoesNotExist:
                return render(request, "login.html", {"error_message": "User info not found"})
        else:
            return render(request, "login.html", {"error_message": "Invalid credentials"})

    return render(request, "login.html")


@login_required(login_url="login")
def dashboard(request):
    """Dashboard view for user to see all generated videos"""
    user = request.user
    try:
        user_info = UserInfo.objects.get(user=user)
    except UserInfo.DoesNotExist:
        # Create new user info
        user_info = UserInfo.objects.create(
            user=user, user_email=user.email, subscription_status="free"
        )
        
        # Create user directories in Supabase
        user_info.create_user_directories()
   
    video_count = len(user_info.user_video.all())
    
    return render(request, "dashboard.html", {"user_info": user_info, "video_count": video_count})


@login_required(login_url="login")
def user_profile(request):
    """Profile settings view for user to update profile information"""
    user = request.user
    try:
        user_info = UserInfo.objects.get(user=user)
    except UserInfo.DoesNotExist:
        return redirect('dashboard')  # Redirect to dashboard if user info doesn't exist
    
    if request.method == 'POST':
        # Handle profile updates if needed
        pass
    
    return render(request, "user_profile.html", {"user_info": user_info})


@login_required(login_url="login")
def upload_profile_image(request):
    """Handle profile image upload to Supabase storage"""
    if request.method == 'POST' and request.FILES.get('profile_image'):
        user_info = UserInfo.objects.get(user=request.user)
        
        # Get the uploaded file
        image_file = request.FILES['profile_image']
        
        # Upload to Supabase using our model method
        url = user_info.upload_profile_image(image_file)
        
        if url:
            return JsonResponse({
                'success': True,
                'image_url': url
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to upload image to storage'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method or no file uploaded'
    }, status=400)


def video_generator(request):
    active = ""
    queryobj = GeneraterVideImage.objects.filter(status="active")

    if queryobj.exists():
        active = queryobj[0].generater_video_image
        
    current_image = {
        "active": active,
    }    
    return render(request, "video_generator.html", current_image)


# Password reset views
class CustomPasswordResetView(PasswordResetView):
    template_name = 'password_reset.html'
    email_template_name = 'email/password_reset_email.html'
    subject_template_name = 'email/password_reset_subject.txt'
    success_url = '/user/password_reset/done/'
    title = 'Password Reset'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = self.title
        return context


class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'password_reset.html'
    title = 'Password Reset Sent'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['done'] = True
        context['title'] = self.title
        return context


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'password_reset.html'
    success_url = '/user/password_reset/complete/'
    title = 'Set New Password'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = self.title
        return context


class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'password_reset.html'
    title = 'Password Reset Complete'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['complete'] = True
        context['title'] = self.title
        return context


@login_required(login_url="login")
def connect_telegram(request):
    """View to allow users to connect their account with Telegram"""
    user_info = get_object_or_404(UserInfo, user=request.user)
    
    if request.method == 'POST':
        telegram_chat_id = request.POST.get('telegram_chat_id')
        
        if telegram_chat_id:
            user_info.telegram_chat_id = telegram_chat_id
            user_info.save()
            
            # Send a test message to verify the connection
            try:
                from ReelsBuilder.telegram_bot import send_message
                success = send_message(telegram_chat_id, f"Hello {request.user.username}! Your ReelsBuilder account is now connected to Telegram.")
                
                if success:
                    # Show success message
                    return render(request, 'connect_telegram.html', {
                        'user_info': user_info,
                        'success_message': 'Your account has been successfully connected to Telegram!'
                    })
                else:
                    # Show error message
                    return render(request, 'connect_telegram.html', {
                        'user_info': user_info,
                        'error_message': 'Could not send a message to the provided chat ID. Please verify it and try again.'
                    })
            except Exception as e:
                # Show error message
                return render(request, 'connect_telegram.html', {
                    'user_info': user_info,
                    'error_message': f'Error: {str(e)}'
                })
                
    return render(request, 'connect_telegram.html', {'user_info': user_info})
