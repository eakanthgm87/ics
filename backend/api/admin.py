"""
Admin panel.

Content models are grouped and given explicit fieldsets + help text so a
non-technical member of staff can work out what each field does without
training. Submissions are read-only apart from the status/notes columns the
office needs to work through them.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Admission,
    Award,
    Brochure,
    Enquiry,
    GalleryImage,
    Person,
    SiteSettings,
    Stat,
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
            "fields": ("name", "role", "department", "qualification"),
            "description": "Name and role show on the card; the rest shows under it.",
        }),
        ("Expanded card", {
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


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("School", {"fields": ("name", "address", "maps_url")}),
        ("Contact", {"fields": ("phone", "mobile", "email", "email_hr")}),
        ("Office hours", {"fields": ("hours_week", "hours_sat")}),
        ("Social profiles", {
            "fields": ("facebook", "instagram", "youtube", "linkedin", "whatsapp"),
            "description": "Leave blank to hide that icon in the footer.",
        }),
    )

    def has_add_permission(self, request):
        # single row; edit the existing one
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
