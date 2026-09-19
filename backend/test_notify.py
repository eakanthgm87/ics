"""Verify the email + WhatsApp notification paths.  python test_notify.py"""
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import override_settings
from django.core import mail
from api.models import Enquiry, Admission
from api.notifications import notify_enquiry, notify_admission

e = Enquiry.objects.first()
a = Admission.objects.first()

with override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    NOTIFY_EMAILS=["office@example.com"],
    WHATSAPP_ENABLED=False,
):
    mail.outbox = []
    r1 = notify_enquiry(e)
    r2 = notify_admission(a)
    print("notify_enquiry  ->", r1)
    print("notify_admission->", r2)
    print("emails sent     :", len(mail.outbox))
    for m in mail.outbox:
        print(f"  subject: {m.subject}")
        print(f"  to     : {m.to}")
        print("  body   :", m.body.splitlines()[0])

# WhatsApp disabled must be a silent no-op, not a crash
with override_settings(WHATSAPP_ENABLED=False):
    from api.notifications import _send_whatsapp
    print("whatsapp disabled ->", _send_whatsapp("test"), "(False = skipped cleanly)")

# a broken SMTP config must NOT raise — the submission still has to succeed
with override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    EMAIL_HOST="smtp.invalid.example", EMAIL_PORT=1, EMAIL_TIMEOUT=2,
    NOTIFY_EMAILS=["office@example.com"],
):
    print("broken SMTP     ->", notify_enquiry(e), "(False = swallowed, no crash)")
