"""
Create the admin user from environment variables, idempotently.

    python manage.py ensure_superuser

Unlike `createsuperuser --noinput`, this is safe to run on every deploy: if
the user already exists it just resets the password to match the environment
instead of erroring out. That matters on Render's free tier, where there is no
shell and the build command is the only place to run management commands.

Reads:
    DJANGO_SUPERUSER_USERNAME   (default: admin)
    DJANGO_SUPERUSER_EMAIL      (default: admin@example.com)
    DJANGO_SUPERUSER_PASSWORD   (required — no password, no user)

Does nothing at all if DJANGO_SUPERUSER_PASSWORD is unset, so local builds and
CI are unaffected.
"""

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the admin user from DJANGO_SUPERUSER_* env vars."

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        if not password:
            self.stdout.write(
                "DJANGO_SUPERUSER_PASSWORD not set - skipping admin user creation."
            )
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True},
        )

        # keep these true even if the row was created some other way
        user.email = email or user.email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        verb = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{verb} superuser '{username}'."))
