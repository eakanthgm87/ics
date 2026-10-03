"""
Outbound notifications for form submissions.

Email goes through Brevo's HTTP API when BREVO_API_KEY is set (HTTPS, so it
works on hosts that block SMTP ports, like Render's free tier), otherwise
through Django's EMAIL_BACKEND. Recipients come from Site settings in /admin,
falling back to NOTIFY_EMAILS in the environment.

Both channels are best-effort: a failure here is logged but never raised, so a
parent's form submission is still saved and still returns 201 even if Brevo or
CallMeBot is down. The record is in the database and visible in /admin either
way — the notification is a convenience, not the system of record.
"""

import logging

import requests
from django.conf import settings
from django.core.mail import EmailMessage

from .models import SiteSettings

log = logging.getLogger(__name__)

CALLMEBOT_URL = "https://api.callmebot.com/whatsapp.php"
BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def recipients():
    """Addresses set in /admin → Site settings, else NOTIFY_EMAILS."""
    saved = SiteSettings.load().notify_emails
    return [e.strip() for e in saved.split(",") if e.strip()] or settings.NOTIFY_EMAILS


def send_email(subject, body, reply_to=None):
    to = recipients()
    if not to:
        log.info("No notification address configured; skipping email for %r", subject)
        return False
    try:
        if settings.BREVO_API_KEY:
            payload = {
                "sender": {"email": settings.DEFAULT_FROM_EMAIL,
                           "name": settings.EMAIL_SENDER_NAME},
                "to": [{"email": e} for e in to],
                "subject": subject,
                "textContent": body,
            }
            if reply_to:
                payload["replyTo"] = {"email": reply_to}
            res = requests.post(
                BREVO_URL,
                json=payload,
                headers={"api-key": settings.BREVO_API_KEY, "accept": "application/json"},
                timeout=10,
            )
            res.raise_for_status()
        else:
            EmailMessage(
                subject, body, settings.DEFAULT_FROM_EMAIL, to,
                reply_to=[reply_to] if reply_to else None,
            ).send()
        return True
    except Exception:
        log.exception("Failed to send notification email for %r", subject)
        return False


def _send_whatsapp(text):
    """Free WhatsApp push via CallMeBot. No-op unless configured."""
    if not (
        settings.WHATSAPP_ENABLED
        and settings.WHATSAPP_PHONE
        and settings.WHATSAPP_APIKEY
    ):
        log.info("WhatsApp not configured; skipping.")
        return False
    try:
        res = requests.get(
            CALLMEBOT_URL,
            params={
                "phone": settings.WHATSAPP_PHONE,
                "text": text,
                "apikey": settings.WHATSAPP_APIKEY,
            },
            timeout=10,
        )
        res.raise_for_status()
        return True
    except Exception:
        log.exception("Failed to send WhatsApp notification")
        return False


def notify_enquiry(enquiry):
    """Contact form → email + WhatsApp."""
    subject = f"[ICS website] Enquiry: {enquiry.subject}"
    body = (
        f"New enquiry from the website.\n\n"
        f"Name    : {enquiry.name}\n"
        f"Email   : {enquiry.email}\n"
        f"Phone   : {enquiry.phone or '—'}\n"
        f"Subject : {enquiry.subject}\n\n"
        f"Message:\n{enquiry.message}\n\n"
        f"Received: {enquiry.created_at:%d %b %Y, %H:%M}\n"
    )
    emailed = send_email(subject, body, reply_to=enquiry.email)

    whatsapped = _send_whatsapp(
        f"*New ICS enquiry*\n"
        f"{enquiry.name} ({enquiry.email})\n"
        f"Phone: {enquiry.phone or '-'}\n"
        f"Subject: {enquiry.subject}\n\n"
        f"{enquiry.message[:400]}"
    )
    return {"email": emailed, "whatsapp": whatsapped}


def notify_admission(admission):
    """Registration form → email with every field (documents stay in /admin)."""
    a = admission
    subject = f"[ICS website] Registration: {a.full_name}"
    rows = [
        ("Student", a.full_name),
        ("Gender", a.gender),
        ("Date of birth", f"{a.dob:%d %b %Y}"),
        ("Religion", a.religion),
        ("Nationality", a.nationality),
        ("Place of birth", a.place_of_birth),
        ("Last school", a.last_school),
        ("Medium", a.medium),
        ("Reason for leaving", a.reason_for_leaving),
        ("Residential address", a.residential_address),
        ("Current address", a.current_address),
        ("Phone", a.phone),
        ("Email", a.email),
        ("Guardian", a.guardian_name),
        ("Guardian email", a.guardian_email),
    ]
    body = (
        "New registration submitted on the website.\n\n"
        + "\n".join(f"{k:<20}: {v or '—'}" for k, v in rows)
        + f"\n\nReceived: {a.created_at:%d %b %Y, %H:%M}\n\n"
        "The transfer certificate and marks card are in the admin:\n"
        f"{settings.PUBLIC_BASE_URL}/admin/api/admission/{a.pk}/change/\n"
    )
    emailed = send_email(subject, body, reply_to=a.email)
    whatsapped = _send_whatsapp(
        f"*New ICS registration*\n"
        f"{admission.full_name} (DOB {admission.dob:%d %b %Y})\n"
        f"Guardian: {admission.guardian_name}\n"
        f"Phone: {admission.phone}"
    )
    return {"email": emailed, "whatsapp": whatsapped}
