#!/bin/bash
# Build script for Vercel

# Install project dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

echo "Build completed successfully!" 