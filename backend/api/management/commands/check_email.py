"""
Confirm the email setup works, without filling in the website form.

    python manage.py check_email
    python manage.py check_email --to someone@example.com

Reports exactly which setting is wrong rather than a raw SMTP traceback.
"""

import smtplib

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Send a test notification email and report what is misconfigured."

    def add_arguments(self, parser):
        parser.add_argument("--to", help="Override NOTIFY_EMAILS for this test.")

    def handle(self, *args, **opts):
        ok = self.style.SUCCESS
        bad = self.style.ERROR
        warn = self.style.WARNING

        backend = settings.EMAIL_BACKEND
        user = settings.EMAIL_HOST_USER
        pw = settings.EMAIL_HOST_PASSWORD
        to = [opts["to"]] if opts["to"] else settings.NOTIFY_EMAILS

        self.stdout.write("Current configuration")
        self.stdout.write(f"  EMAIL_BACKEND  : {backend}")
        self.stdout.write(f"  EMAIL_HOST     : {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        self.stdout.write(f"  EMAIL_HOST_USER: {user or '(empty)'}")
        self.stdout.write(f"  PASSWORD       : {'set (' + str(len(pw)) + ' chars)' if pw else '(empty)'}")
        self.stdout.write(f"  NOTIFY_EMAILS  : {', '.join(to) if to else '(empty)'}")
        self.stdout.write("")

        # --- pre-flight checks, most common mistakes first ----------------
        if "console" in backend:
            self.stdout.write(
                warn("EMAIL_BACKEND is the console backend, so nothing will be sent.")
            )
            self.stdout.write(
                "Set this in .env:\n"
                "  EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend"
            )
            return
        if not user:
            self.stdout.write(bad("EMAIL_HOST_USER is empty. Set your Gmail address."))
            return
        if not pw:
            self.stdout.write(bad("EMAIL_HOST_PASSWORD is empty. Set the App Password."))
            return
        if len(pw.replace(" ", "")) != 16 and "gmail" in settings.EMAIL_HOST:
            self.stdout.write(
                warn(
                    f"Password is {len(pw)} characters. A Gmail App Password is 16. "
                    "Your normal Gmail password will be rejected."
                )
            )
        if not to:
            self.stdout.write(bad("NOTIFY_EMAILS is empty. Nobody would be notified."))
            return

        # --- actually send -------------------------------------------------
        self.stdout.write(f"Sending a test email to {', '.join(to)} …")
        try:
            sent = send_mail(
                subject="[ICS website] Test email",
                message=(
                    "This is a test from the ICS website backend.\n\n"
                    "If you can read this, form notifications will arrive here."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=to,
                fail_silently=False,
            )
        except smtplib.SMTPAuthenticationError:
            self.stdout.write(bad("\nGmail rejected the username/password."))
            self.stdout.write(
                "Almost always one of:\n"
                "  * You used your Gmail password instead of an App Password\n"
                "  * 2-Step Verification is not enabled on the account\n"
                "  * The App Password was revoked\n"
                "Create a new one: https://myaccount.google.com/apppasswords"
            )
            return
        except Exception as exc:  # noqa: BLE001 - report anything else plainly
            self.stdout.write(bad(f"\nSending failed: {type(exc).__name__}: {exc}"))
            self.stdout.write(
                "If this is a timeout, check that port 587 is not blocked by your "
                "network or firewall."
            )
            return

        if sent:
            self.stdout.write(ok("\nSent. Check the inbox (and the spam folder)."))
        else:
            self.stdout.write(bad("\nsend_mail reported 0 messages sent."))
