"""
Admin panel.

Content models are grouped and given explicit fieldsets + help text so a
non-technical member of staff can work out what each field does without
training. Submissions are read-only apart from the status/notes columns the
office needs to work through them.
"""

from django import forms
from django.contrib import admin, messages
from django.utils.html import format_html

from .models import (
    AcademicStage,
    Admission,
    Award,
    Brochure,
    Chapter,
    Enquiry,
    Facility,
    GalleryImage,
    PageSection,
    Person,
    Program,
    SiteSettings,
    Stat,
    StageCard,
)


def thumb(file_field, height=48):
    if not file_field:
        return "—"
    return format_html(
        '<img src="{}" style="height:{}px;width:auto;'
        'border-radius:4px;object-fit:cover;background:#eee" />',
        file_field.url,
        height,
    )


# --------------------------------------------------------------- submissions


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "email", "phone", "created_at", "is_handled")
    list_filter = ("is_handled", "subject", "created_at")
    search_fields = ("name", "email", "phone", "message")
    list_editable = ("is_handled",)
    date_hierarchy = "created_at"
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")
    fieldsets = (
        ("Submitted by the visitor", {
            "fields": ("name", "email", "phone", "subject", "message", "created_at"),
        }),
        ("Office use", {"fields": ("is_handled", "notes")}),
    )

    def has_add_permission(self, request):
        return False  # only the website creates these


@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin):
    list_display = ("full_name", "dob", "guardian_name", "phone", "created_at", "status")
    list_filter = ("status", "gender", "created_at")
    search_fields = ("first_name", "last_name", "guardian_name", "email", "phone")
    list_editable = ("status",)
    date_hierarchy = "created_at"
    readonly_fields = (
        "first_name", "last_name", "gender", "dob", "religion", "nationality",
        "place_of_birth", "last_school", "medium", "reason_for_leaving",
        "residential_address", "current_address", "phone", "email",
        "guardian_name", "guardian_email", "created_at", "documents",
    )
    fieldsets = (
        ("Student", {
            "fields": ("first_name", "last_name", "gender", "dob", "religion",
                       "nationality", "place_of_birth"),
        }),
        ("Previous schooling", {
            "fields": ("last_school", "medium", "reason_for_leaving"),
        }),
        ("Contact", {
            "fields": ("residential_address", "current_address", "phone", "email",
                       "guardian_name", "guardian_email"),
        }),
        ("Documents", {"fields": ("documents",)}),
        ("Office use", {"fields": ("status", "notes", "created_at")}),
    )

    @admin.display(description="Uploaded documents")
    def documents(self, obj):
        links = []
        for field, label in ((obj.tc, "Transfer certificate"), (obj.marks, "Marks card")):
            if field:
                links.append(
                    format_html('<a href="{}" target="_blank">{}</a>', field.url, label)
                )
        return format_html(" &nbsp;|&nbsp; ".join(["{}"] * len(links)), *links) if links else "—"

    def has_add_permission(self, request):
        return False


# -------------------------------------------------------------- site content


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("preview", "title", "category", "size", "order", "is_published")
    list_display_links = ("preview", "title")
    list_filter = ("category", "is_published")
    search_fields = ("title", "caption")
    list_editable = ("category", "size", "order", "is_published")
    fieldsets = (
        ("The photo", {
            "fields": ("image",),
            "description": "JPG, PNG, WEBP or SVG. Landscape photos work best.",
        }),
        ("What it says", {"fields": ("title", "caption", "category")}),
        ("How it appears", {
            "fields": ("size", "order", "is_published"),
            "description": "Mix tall / medium / short so the collage looks natural.",
        }),
    )

    @admin.display(description="Preview")
    def preview(self, obj):
        return thumb(obj.image, 44)


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ("preview", "name", "role", "department", "order", "is_published")
    list_display_links = ("preview", "name")
    list_editable = ("order", "is_published")
    search_fields = ("name", "role", "department")
    fieldsets = (
        ("Portrait", {"fields": ("photo",)}),
        ("Details", {
            "fields": ("name", "role", "department", "qualification", "experience"),
            "description": "Name and designation show on the card; everything "
                           "shows in the popup.",
        }),
        ("Popup", {
            "fields": ("bio",),
            "description": "Only visible once a visitor clicks the card.",
        }),
        ("Ordering", {"fields": ("order", "is_published")}),
    )

    @admin.display(description="Photo")
    def preview(self, obj):
        return thumb(obj.photo, 44)


@admin.register(Stat)
class StatAdmin(admin.ModelAdmin):
    list_display = ("label", "value", "count_from", "suffix", "icon", "order", "is_published")
    list_editable = ("value", "suffix", "icon", "order", "is_published")
    fieldsets = (
        ("The number", {
            "fields": ("label", "value", "suffix"),
            "description": 'Example: label "Founded", value 1979.',
        }),
        ("How it counts", {
            "fields": ("count_from", "grouped"),
            "description": "Leave 'count from' blank to count up from zero. "
                           "Untick the separator for years.",
        }),
        ("Appearance", {"fields": ("icon", "order", "is_published")}),
    )


@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = ("preview", "year", "title", "body", "order", "is_published")
    list_display_links = ("preview", "title")
    list_editable = ("year", "order", "is_published")
    search_fields = ("title", "body", "year")
    fieldsets = (
        ("Artwork", {"fields": ("image",), "description": "Optional header image."}),
        ("Details", {"fields": ("year", "title", "body")}),
        ("Ordering", {"fields": ("order", "is_published")}),
    )

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.image, 40)


@admin.register(PageSection)
class PageSectionAdmin(admin.ModelAdmin):
    list_display = ("label", "title", "preview", "updated_at")
    search_fields = ("label", "title", "body")
    readonly_fields = ("key",)
    fieldsets = (
        (None, {"fields": ("label", "key")}),
        ("Text", {
            "fields": ("eyebrow", "title", "subtitle", "body", "quote"),
            "description": "Not every section uses every field. Leave a field "
                           "blank to keep the website's built-in text.",
        }),
        ("Image", {"fields": ("image",),
                   "description": "Leave empty to keep the current picture."}),
    )

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.image, 40)

    # each key is wired to one spot on the site; seed creates them all
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("title", "link", "icon", "order", "is_published")
    list_editable = ("order", "is_published")
    fields = ("title", "text", "link", "icon", "order", "is_published")


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ("preview", "title", "order", "is_published")
    list_display_links = ("preview", "title")
    list_editable = ("order", "is_published")
    fieldsets = (
        ("Photo", {"fields": ("image", "alt")}),
        ("Text", {"fields": ("title", "text", "tagline")}),
        ("Ordering", {"fields": ("order", "is_published")}),
    )

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.image, 40)


class StageCardInline(admin.TabularInline):
    model = StageCard
    extra = 0
    fields = ("tag", "title", "text", "order")


@admin.register(AcademicStage)
class AcademicStageAdmin(admin.ModelAdmin):
    list_display = ("preview", "title", "order", "is_published")
    list_display_links = ("preview", "title")
    list_editable = ("order", "is_published")
    inlines = [StageCardInline]
    fieldsets = (
        ("Photo", {"fields": ("image", "alt")}),
        ("Text", {"fields": ("title", "text")}),
        ("Ordering", {"fields": ("order", "is_published")}),
    )

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.image, 40)


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("preview", "title", "order", "is_published")
    list_display_links = ("preview", "title")
    list_editable = ("order", "is_published")
    fieldsets = (
        ("Photo", {"fields": ("image", "alt")}),
        ("Text", {"fields": ("title", "text", "tag", "badge")}),
        ("Ordering", {"fields": ("order", "is_published")}),
    )

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.image, 40)


@admin.register(Brochure)
class BrochureAdmin(admin.ModelAdmin):
    list_display = ("title", "download", "is_active", "created_at")
    list_editable = ("is_active",)
    fields = ("title", "file", "is_active")

    @admin.display(description="File")
    def download(self, obj):
        if not obj.file:
            return "—"
        return format_html('<a href="{}" target="_blank">Download</a>', obj.file.url)


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = "__all__"
        # the key is a secret: never echo it back into the page
        widgets = {"brevo_api_key": forms.PasswordInput(render_value=False)}

    def clean_brevo_api_key(self):
        # a blank box means "keep the saved key", not "delete it"
        return self.cleaned_data["brevo_api_key"].strip() or self.instance.brevo_api_key


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    form = SiteSettingsForm
    list_display = ("__str__", "notify_emails", "brevo_status")
    actions = ["send_test_email"]
    readonly_fields = ("brevo_status",)
    fieldsets = (
        ("School", {"fields": ("name", "address", "maps_url")}),
        ("Contact", {"fields": ("phone", "mobile", "email", "email_hr")}),
        ("Office hours", {"fields": ("hours_week", "hours_sat")}),
        ("Social profiles", {
            "fields": ("facebook", "instagram", "youtube", "twitter", "linkedin",
                       "whatsapp"),
            "description": "Leave blank to hide that icon in the footer.",
        }),
        ("Form notifications", {
            "fields": ("notify_emails",),
            "description": "Every admission and contact form submission is "
                           "emailed to these addresses.",
        }),
        ("Email service (Brevo)", {
            "fields": ("brevo_status", "brevo_api_key", "email_sender"),
            "description": "To check the setup, go back to the Site settings "
                           "list, tick the row and run “Send a test email”.",
        }),
    )

    @admin.display(description="Brevo")
    def brevo_status(self, obj):
        from django.conf import settings as conf
        if obj.brevo_api_key:
            return f"Key saved (…{obj.brevo_api_key[-4:]})"
        if conf.BREVO_API_KEY:
            return "Using the BREVO_API_KEY server setting"
        return "Not set — emails are not sent through Brevo"

    @admin.action(description="Send a test email to the notification addresses")
    def send_test_email(self, request, queryset):
        from .notifications import recipients, send_email
        to = ", ".join(recipients()) or "nobody"
        if send_email(
            "[ICS website] Test email",
            "This is a test from the ICS website admin.\n\n"
            "If you can read this, form notifications will arrive here.",
        ):
            self.message_user(request, f"Test email sent to {to}. Check the inbox "
                                       "(and the spam folder).", messages.SUCCESS)
        else:
            self.message_user(request, "Sending failed. Check the Brevo key, that "
                                       "the sender address is verified in Brevo, "
                                       "and the server log for details.", messages.ERROR)

    def has_add_permission(self, request):
        # single row; edit the existing one
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
