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

    @override_settings(BREVO_API_KEY="key", NOTIFY_EMAILS=["office@example.com"])
    def test_brevo_failure_never_raises(self):
        with mock.patch("api.notifications.requests.post", side_effect=OSError("down")):
            self.assertFalse(send_email("Subj", "Body"))
