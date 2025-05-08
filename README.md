# ReelsBuilder - Django with Neon PostgreSQL

A Django project using Neon PostgreSQL for serverless deployment on Vercel.

## Configuration

The project is configured to use Neon PostgreSQL by default, which is optimized for serverless environments. It maintains Supabase as a fallback option.

### Database

- **Neon PostgreSQL**: Default database for serverless compatibility
- **Connection pooling**: Uses Neon's built-in connection pooling
- **Zero-connection time**: Connections are closed immediately after use to avoid connection limits in serverless

### Deployment

To deploy on Vercel:

1. Connect your repository to Vercel
2. Add these environment variables (optional, as defaults are in settings.py):
   - `DATABASE_URL`: Your Neon database URL
   - `SECRET_KEY`: Django secret key
   - `DEBUG`: Set to "false" for production

### Running Migrations

Before deploying, run migrations on your Neon database:

```
python migrate_neon.py
```

Or manually:

```
python manage.py migrate
```

### Switching to Supabase

If you prefer to use Supabase instead of Neon:

1. In `settings.py`, uncomment the line:
   ```python
   # DATABASES['default'] = SUPABASE_DB
   ```
2. Comment out the Neon configuration above it

## Vercel Deployment Instructions

### Environment Variables

Set these environment variables in your Vercel project settings:

- `SECRET_KEY`: Django secret key
- `SUPABASE_DB_PASSWORD`: Supabase database password
- `DEBUG`: Set to 'false' for production

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set the required environment variables
3. Deploy with these settings:
   - Framework Preset: Other
   - Build Command: None (leave empty)
   - Output Directory: None (leave empty)
   - Install Command: pip install -r requirements.txt

### Database Connection

The project is configured to connect to your Supabase PostgreSQL database. 