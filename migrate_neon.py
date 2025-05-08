#!/usr/bin/env python
"""
Simple script to run migrations on the Neon database.
This can be run manually or as part of CI/CD.

Usage: python migrate_neon.py
"""

import os
import sys
import subprocess

# Set environment variables for Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ReelsBuilder.settings')

def run_migrations():
    print("Running migrations on Neon database...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("Migrations completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Migration failed with error: {e}")
        return False

if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1) 