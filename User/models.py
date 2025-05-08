from django.db import models
from User import const
import uuid
from django.contrib.auth.models import User
import requests
from django.conf import settings
import os
import json
from django.utils import timezone
from datetime import timedelta

# Create your models here.

class StorageFactory:
    """Factory to provide the appropriate storage backend based on environment"""
    
    @staticmethod
    def get_storage():
        """
        Returns the appropriate storage backend based on environment settings.
        Currently supports:
        - Supabase Storage
        - Will support others like S3, Cloudinary, etc.
        """
        storage_provider = getattr(settings, 'STORAGE_PROVIDER', 'supabase')
        
        if storage_provider == 'supabase':
            return SupabaseStorage()
        # Add other storage providers as needed
        # elif storage_provider == 's3':
        #     return S3Storage()
        else:
            # Default to Supabase for backwards compatibility
            return SupabaseStorage()
    
class SupabaseStorage:
    """Supabase storage implementation"""
    
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
    
    def initialize(self):
        """Initialize storage bucket if it doesn't exist"""
        try:
            # Prepare request headers
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
            
            # List buckets to check if ours exists
            list_buckets_url = f"{self.supabase_url}/storage/v1/bucket"
            response = requests.get(list_buckets_url, headers=headers)
            
            # If successful response
            if response.status_code == 200:
                buckets = response.json()
                bucket_exists = any(bucket.get('name') == self.bucket_name for bucket in buckets)
                
                # Create bucket if it doesn't exist
                if not bucket_exists:
                    create_bucket_url = f"{self.supabase_url}/storage/v1/bucket"
                    bucket_data = {
                        "name": self.bucket_name,
                        "public": True,  # Make bucket publicly accessible
                        "file_size_limit": 52428800  # 50MB in bytes
                    }
                    create_response = requests.post(
                        create_bucket_url, 
                        headers=headers, 
                        data=json.dumps(bucket_data)
                    )
                    
                    if create_response.status_code in [200, 201]:
                        print(f"Created Supabase storage bucket: {self.bucket_name}")
                    else:
                        print(f"Failed to create Supabase bucket. Status: {create_response.status_code}")
                else:
                    print(f"Supabase storage bucket '{self.bucket_name}' already exists.")
            else:
                print(f"Failed to check Supabase buckets. Status: {response.status_code}")
                
        except Exception as e:
            print(f"Error initializing Supabase storage: {str(e)}")
    
    def create_directory(self, path):
        """Create a directory by uploading an empty placeholder file"""
        try:
            # Adding .gitkeep as an empty file to create the directory
            full_path = f"{path}.gitkeep"
            
            # Prepare request headers
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
            
            # Upload URL
            upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}/{full_path}"
            
            # Upload empty file to create the directory
            response = requests.post(
                upload_url,
                headers=headers,
                data=b""  # Empty file
            )
            
            if response.status_code in [200, 201]:
                return True
            else:
                print(f"Failed to create directory {path}. Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error creating directory: {str(e)}")
            return False
    
    def upload_file(self, file_data, path):
        """Upload a file to the specified path"""
        try:
            # Prepare request headers
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
            }
            
            # Upload URL
            upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}/{path}"
            
            # Upload the file
            response = requests.post(
                upload_url,
                headers=headers,
                data=file_data
            )
            
            if response.status_code in [200, 201]:
                # Return the public URL
                return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{path}"
            else:
                print(f"Failed to upload file. Status: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            return None


class Videos(models.Model):

    id = models.UUIDField(default=uuid.uuid4,editable=False,primary_key=True,unique=True)
    title = models.CharField(max_length=200,null=False,blank=False,default="Unknown")
    video_id = models.CharField(max_length=200,null=False,blank=False)
    download_link = models.URLField(max_length=200,unique=True,null=False,blank=False)
    time_created = models.DateTimeField()

    def __str__(self):
        return str(self.title)



class UserInfo(models.Model):

    id = models.UUIDField(default=uuid.uuid4,editable=False,primary_key=True,unique=True)
    user = models.OneToOneField(User,on_delete=models.CASCADE,null=True,blank=True)
    user_email = models.EmailField(max_length=200,null=False,blank=False)
    user_video = models.ManyToManyField(Videos,blank=True)
    subscription_status = models.CharField(max_length=100,choices=const.subscription_status_list)
    profile_image = models.CharField(max_length=500, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True, help_text="Telegram chat ID for notifications")

    def __str__(self):
        return self.user_email
    
    @staticmethod
    def initialize_storage():
        """Initialize storage bucket if it doesn't exist"""
        storage = StorageFactory.get_storage()
        storage.initialize()
    
    def create_user_directories(self):
        """Create necessary directories for the user in storage"""
        try:
            storage = StorageFactory.get_storage()
            
            # Define the directories to create
            directories = [
                f"{self.user.username}/Music/",
                f"{self.user.username}/Fonts/",
                f"{self.user.username}/Profile/",
                f"{self.user.username}/Other/"
            ]
            
            # Create each directory
            success = True
            for directory in directories:
                if not storage.create_directory(directory):
                    print(f"Warning: Failed to create directory {directory}")
                    success = False
            
            print(f"Created directory structure for user: {self.user.username}")
            return success
        except Exception as e:
            print(f"Error creating user directories: {str(e)}")
            return False
    
    def upload_file_to_supabase(self, file_obj, directory_type, filename=None):
        """
        Upload a file to the user's directory in storage
        
        Args:
            file_obj: File object to upload (should have read() method)
            directory_type: One of "Music", "Fonts", "Profile", "Other"
            filename: Optional filename to use (if not provided, uses file_obj's name)
        
        Returns:
            URL of the uploaded file if successful, None otherwise
        """
        try:
            if not filename and hasattr(file_obj, 'name'):
                filename = os.path.basename(file_obj.name)
            
            if not filename:
                # Generate a random filename if none is provided
                filename = f"{uuid.uuid4()}{os.path.splitext(file_obj.name)[1]}"
                
            # Validate directory type
            valid_dirs = ["Music", "Fonts", "Profile", "Other"]
            if directory_type not in valid_dirs:
                directory_type = "Other"
                
            # Create full path
            path = f"{self.user.username}/{directory_type}/{filename}"
            
            # Get storage backend
            storage = StorageFactory.get_storage()
            
            # Read file contents
            file_data = file_obj.read()
            
            # Upload to storage
            return storage.upload_file(file_data, path)
                
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            return None
    
    def upload_profile_image(self, image_file):
        """
        Upload a profile image to the user's Profile directory
        """
        url = self.upload_file_to_supabase(image_file, "Profile")
        if url:
            self.profile_image = url
            self.save()
        return url

    def send_telegram_notification(self, message):
        """
        Send a notification to the user via Telegram if they have a chat ID
        
        Args:
            message: Message text to send
        
        Returns:
            True if message was sent, False otherwise
        """
        if not self.telegram_chat_id:
            return False
            
        try:
            from ReelsBuilder.telegram_bot import send_message
            return send_message(self.telegram_chat_id, message)
        except Exception as e:
            print(f"Error sending Telegram notification: {str(e)}")
            return False



class EmailVerificationToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Verification token for {self.user.username}"
    
    @property
    def is_valid(self):
        """Check if token is still valid (not expired)"""
        # Token expires after 24 hours
        return self.created_at >= timezone.now() - timedelta(hours=24)


class GeneraterVideImage(models.Model):

    id = models.UUIDField(default=uuid.uuid4,editable=False,primary_key=True,unique=True)
    title = models.CharField(max_length = 200 ,null=False,blank=False,default ="My_Image")
    status = models.CharField(max_length=100,choices=const.list_generator_image_status)
    generater_video_image = models.ImageField(upload_to="images/",default="images/default.pdf")
    created_on = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
       return  self.title