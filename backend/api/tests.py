from unittest import mock

from django.test import TestCase, override_settings

from .models import SiteSettings
from .notifications import BREVO_URL, recipients, send_email


class NotificationTests(TestCase):
    @override_settings(NOTIFY_EMAILS=["env@example.com"])
    def test_admin_recipients_win_over_env(self):
        self.assertEqual(recipients(), ["env@example.com"])
        s = SiteSettings.load()
        s.notify_emails = "office@example.com, head@example.com"
        s.save()
        self.assertEqual(recipients(), ["office@example.com", "head@example.com"])

    @override_settings(BREVO_API_KEY="key", DEFAULT_FROM_EMAIL="from@example.com",
                       NOTIFY_EMAILS=["office@example.com"])
    def test_brevo_payload(self):
        with mock.patch("api.notifications.requests.post") as post:
            self.assertTrue(send_email("Subj", "Body", reply_to="parent@example.com"))
        url, = post.call_args.args
        sent = post.call_args.kwargs
        self.assertEqual(url, BREVO_URL)
        self.assertEqual(sent["headers"]["api-key"], "key")
        self.assertEqual(sent["json"]["to"], [{"email": "office@example.com"}])
        self.assertEqual(sent["json"]["replyTo"], {"email": "parent@example.com"})

    @override_settings(BREVO_API_KEY="env-key", DEFAULT_FROM_EMAIL="env@example.com",
                       NOTIFY_EMAILS=["office@example.com"])
    def test_admin_brevo_settings_win_over_env(self):
        s = SiteSettings.load()
        s.brevo_api_key, s.email_sender = "admin-key", "admin@example.com"
        s.save()
        with mock.patch("api.notifications.requests.post") as post:
            send_email("Subj", "Body")
        sent = post.call_args.kwargs
        self.assertEqual(sent["headers"]["api-key"], "admin-key")
        self.assertEqual(sent["json"]["sender"]["email"], "admin@example.com")

    def test_blank_key_in_admin_form_keeps_saved_key(self):
        from .admin import SiteSettingsForm
        s = SiteSettings.load()
        s.brevo_api_key = "saved-key"
        s.save()
        data = {f: getattr(s, f) or "" for f in SiteSettingsForm().fields}
        data.update(brevo_api_key="", name="ICS", address="a", phone="1",
                    email="office@example.com")
        form = SiteSettingsForm(data, instance=s)
        self.assertTrue(form.is_valid(), form.errors)
        self.assertEqual(form.save().brevo_api_key, "saved-key")

    def test_settings_api_never_exposes_the_key(self):
        s = SiteSettings.load()
        s.brevo_api_key = "secret-key"
        s.save()
        self.assertNotIn("secret-key", self.client.get("/api/settings/").content.decode())

    @override_settings(BREVO_API_KEY="key", NOTIFY_EMAILS=["office@example.com"])
    def test_brevo_failure_never_raises(self):
        with mock.patch("api.notifications.requests.post", side_effect=OSError("down")):
            self.assertFalse(send_email("Subj", "Body"))
