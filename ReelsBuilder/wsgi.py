import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the project path to the sys.path (needed for Vercel)
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.insert(0, path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ReelsBuilder.settings')

# Initialize application 
application = get_wsgi_application()

# For Vercel deployment (Vercel looks for 'app')
app = application

# Initialize Supabase storage bucket when the server starts
from User.models import UserInfo
UserInfo.initialize_storage()
