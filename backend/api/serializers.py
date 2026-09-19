"""
Serializers.

The content serializers deliberately emit the *exact* key names the React
components already use (`src`, `title`, `cat`, `span`, `img`, `qual`, …) so the
frontend can swap a hardcoded array for an API response with no reshaping.
"""

import re
from datetime import date

from django.conf import settings
from rest_framework import serializers

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


def absolute(url, request=None):
    """
    Media URLs must be absolute: the frontend runs on a different origin, so a
    relative "/media/x.jpg" would be fetched from the frontend and 404.

    Order of preference:
      1. PUBLIC_BASE_URL   — set this in production (behind a proxy/CDN)
      2. the request        — correct automatically in local dev, no config
      3. the raw path       — last resort
    """
    if not url:
        return ""
    if url.startswith(("http://", "https://")):
        return url
    if settings.PUBLIC_BASE_URL:
        return f"{settings.PUBLIC_BASE_URL}{url}"
    if request is not None:
        return request.build_absolute_uri(url)
    return url


# ------------------------------------------------------------- submissions


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ["name", "email", "phone", "subject", "message"]

    def validate_name(self, v):
        v = v.strip()
        if len(v) < 2:
            raise serializers.ValidationError("At least 2 characters")
        return v

    def validate_phone(self, v):
        v = (v or "").strip()
        if v:
            digits = re.sub(r"\D", "", v)
            if not 10 <= len(digits) <= 15:
                raise serializers.ValidationError("Enter a valid phone number")
        return v

    def validate_message(self, v):
        v = v.strip()
        if len(v) < 10:
            raise serializers.ValidationError(
                "Please add a little more detail (10+ characters)"
            )
        return v


class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = [
            "first_name", "last_name", "gender", "dob", "religion", "nationality",
            "place_of_birth", "last_school", "medium", "reason_for_leaving",
            "residential_address", "current_address", "phone", "email",
            "guardian_name", "guardian_email", "tc", "marks",
        ]

    def validate_dob(self, v):
        today = date.today()
        if v > today:
            raise serializers.ValidationError("Date of birth cannot be in the future")
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 2:
            raise serializers.ValidationError("Applicant must be at least 2 years old")
        if age > 25:
            raise serializers.ValidationError("Please check the year of birth")
        return v


# ------------------------------------------------------------ site content


class GallerySerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    cat = serializers.CharField(source="category")
    span = serializers.CharField(source="size")

    class Meta:
        model = GalleryImage
        fields = ["id", "src", "title", "caption", "cat", "span"]

    def get_src(self, obj):
        return absolute(obj.image.url if obj.image else "", self.context.get("request"))


class PersonSerializer(serializers.ModelSerializer):
    img = serializers.SerializerMethodField()
    dept = serializers.CharField(source="department")
    qual = serializers.CharField(source="qualification")

    class Meta:
        model = Person
        fields = ["id", "name", "role", "dept", "qual", "bio", "img"]

    def get_img(self, obj):
        return absolute(obj.photo.url if obj.photo else "", self.context.get("request"))


class StatSerializer(serializers.ModelSerializer):
    to = serializers.IntegerField(source="value")
    # `from` is a Python keyword, so it is added in to_representation
    class Meta:
        model = Stat
        fields = ["id", "label", "to", "suffix", "grouped", "icon"]

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if obj.count_from is not None:
            data["from"] = obj.count_from
        return data


class AwardSerializer(serializers.ModelSerializer):
    img = serializers.SerializerMethodField()

    class Meta:
        model = Award
        fields = ["id", "year", "title", "body", "img"]

    def get_img(self, obj):
        return absolute(obj.image.url if obj.image else "", self.context.get("request"))


class BrochureSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Brochure
        fields = ["id", "title", "url"]

    def get_url(self, obj):
        return absolute(obj.file.url if obj.file else "", self.context.get("request"))


class SiteSettingsSerializer(serializers.ModelSerializer):
    socials = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            "name", "address", "phone", "mobile", "email", "email_hr",
            "hours_week", "hours_sat", "maps_url", "socials",
        ]

    def get_socials(self, obj):
        pairs = [
            ("Facebook", obj.facebook),
            ("Instagram", obj.instagram),
            ("YouTube", obj.youtube),
            ("LinkedIn", obj.linkedin),
            ("WhatsApp", obj.whatsapp),
        ]
        return [{"name": n, "href": h} for n, h in pairs if h]
