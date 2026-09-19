"""
Outbound notifications for form submissions.

Both channels are best-effort: a failure here is logged but never raised, so a
parent's form submission is still saved and still returns 201 even if Gmail or
CallMeBot is down. The record is in the database and visible in /admin either
way — the notification is a convenience, not the system of record.
"""

import logging

import requests
from django.conf import settings
from django.core.mail import send_mail

log = logging.getLogger(__name__)

CALLMEBOT_URL = "https://api.callmebot.com/whatsapp.php"


def _send_email(subject, body):
    if not settings.NOTIFY_EMAILS:
        log.info("No NOTIFY_EMAILS configured; skipping email for %r", subject)
        return False
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=settings.NOTIFY_EMAILS,
            fail_silently=False,
        )
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
    emailed = _send_email(subject, body)

    whatsapped = _send_whatsapp(
        f"*New ICS enquiry*\n"
        f"{enquiry.name} ({enquiry.email})\n"
        f"Phone: {enquiry.phone or '-'}\n"
        f"Subject: {enquiry.subject}\n\n"
        f"{enquiry.message[:400]}"
    )
    return {"email": emailed, "whatsapp": whatsapped}


def notify_admission(admission):
    """Registration form → email (documents stay in /admin, never emailed)."""
    subject = f"[ICS website] Registration: {admission.full_name}"
    body = (
        f"New registration submitted.\n\n"
        f"Student  : {admission.full_name}\n"
        f"Gender   : {admission.gender}\n"
        f"DOB      : {admission.dob:%d %b %Y}\n"
        f"Guardian : {admission.guardian_name}\n"
        f"Phone    : {admission.phone}\n"
        f"Email    : {admission.email}\n"
        f"Address  : {admission.residential_address}\n"
        f"Last school: {admission.last_school or '—'}\n\n"
        f"Both documents were uploaded. View them in the admin:\n"
        f"{settings.PUBLIC_BASE_URL}/admin/api/admission/{admission.pk}/change/\n"
    )
    emailed = _send_email(subject, body)
    whatsapped = _send_whatsapp(
        f"*New ICS registration*\n"
        f"{admission.full_name} (DOB {admission.dob:%d %b %Y})\n"
        f"Guardian: {admission.guardian_name}\n"
        f"Phone: {admission.phone}"
    )
    return {"email": emailed, "whatsapp": whatsapped}
