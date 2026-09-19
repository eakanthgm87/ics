#!/usr/bin/env bash
# Render build command. Runs on every deploy.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Render's free tier has no shell, so bootstrap from here instead.
# Both commands are idempotent and safe to re-run on every deploy.
python manage.py ensure_superuser        # no-op unless DJANGO_SUPERUSER_PASSWORD is set
python manage.py seed                    # updates existing rows rather than duplicating
