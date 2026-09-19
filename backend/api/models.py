"""
Data model for the Indiranagar Cambridge School site.

Two groups:
  1. Submissions  — Enquiry, Admission (written by the public forms)
  2. Site content — GalleryImage, Person, Stat, Award, Brochure, SiteSettings
                    (edited by staff in /admin, read by the frontend)

FileField is used rather than ImageField throughout: ImageField requires
Pillow purely to read image dimensions, which nothing here needs.
"""

from django.core.validators import FileExtensionValidator
from django.db import models

IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "svg", "gif"]
DOC_EXT = ["pdf", "png", "jpg", "jpeg"]


class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Ordered(models.Model):
    """Shared ordering + publish toggle for every content model."""

    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )
    is_published = models.BooleanField(
        default=True, help_text="Untick to hide from the website without deleting."
    )

    class Meta:
        abstract = True
        ordering = ["order", "id"]


# --------------------------------------------------------------- submissions


class Enquiry(TimeStamped):
    """Contact form submission."""

    SUBJECTS = [
        ("Admissions & Registration", "Admissions & Registration"),
        ("Campus Visit / Tour", "Campus Visit / Tour"),
        ("Fees & Scholarships", "Fees & Scholarships"),
        ("Transport & Facilities", "Transport & Facilities"),
        ("Careers at ICS", "Careers at ICS"),
        ("Something else", "Something else"),
    ]

    name = models.CharField(max_length=60)
    email = models.EmailField(max_length=120)
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=40, choices=SUBJECTS)
    message = models.TextField(max_length=1000)

    is_handled = models.BooleanField(
        default=False, help_text="Tick once the office has replied."
    )
    notes = models.TextField(blank=True, help_text="Internal notes. Not shown publicly.")

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Enquiries"

    def __str__(self):
        return f"{self.name} — {self.subject}"


class Admission(TimeStamped):
    """Registration form submission, including the two required documents."""

    GENDERS = [
        ("Female", "Female"),
        ("Male", "Male"),
        ("Prefer not to say", "Prefer not to say"),
    ]
    STATUS = [
        ("new", "New"),
        ("reviewing", "Under review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    # student
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=20, choices=GENDERS)
    dob = models.DateField("Date of birth")
    religion = models.CharField(max_length=40, blank=True)
    nationality = models.CharField(max_length=40, blank=True)
    place_of_birth = models.CharField(max_length=60, blank=True)

    # schooling
    last_school = models.CharField(max_length=100, blank=True)
    medium = models.CharField("Medium of instruction", max_length=40, blank=True)
    reason_for_leaving = models.CharField(max_length=150, blank=True)

    # contact
    residential_address = models.CharField(max_length=200)
    current_address = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=120)
    guardian_name = models.CharField(max_length=60)
    guardian_email = models.EmailField(max_length=120, blank=True)

    # documents
    tc = models.FileField(
        "Transfer certificate",
        upload_to="admissions/%Y/%m/",
        validators=[FileExtensionValidator(DOC_EXT)],
    )
    marks = models.FileField(
        "Marks card / transcripts",
        upload_to="admissions/%Y/%m/",
        validators=[FileExtensionValidator(DOC_EXT)],
    )

    status = models.CharField(max_length=20, choices=STATUS, default="new")
    notes = models.TextField(blank=True, help_text="Internal notes. Not shown publicly.")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_status_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


# ------------------------------------------------------------- site content


class GalleryImage(Ordered, TimeStamped):
    """A photo in the Gallery page collage."""

    CATEGORIES = [
        ("Sports", "Sports"),
        ("Academics", "Academics"),
        ("Events", "Events"),
        ("Campus", "Campus"),
    ]
    SIZES = [
        ("tall", "Tall — full height tile"),
        ("mid", "Medium"),
        ("short", "Short"),
    ]

    title = models.CharField(max_length=80, help_text="Shown on the tile and popup.")
    caption = models.TextField(
        max_length=300, blank=True, help_text="Shown in the popup under the title."
    )
    category = models.CharField(
        max_length=20, choices=CATEGORIES, help_text="Drives the filter tabs."
    )
    image = models.FileField(
        upload_to="gallery/", validators=[FileExtensionValidator(IMAGE_EXT)]
    )
    size = models.CharField(
        max_length=10,
        choices=SIZES,
        default="mid",
        help_text="Tile height in the collage. Mix these for a natural layout.",
    )

    def __str__(self):
        return self.title


class Person(Ordered, TimeStamped):
    """A card in the About page "Our People" carousel."""

    name = models.CharField(max_length=80, help_text='e.g. "Science Faculty" or a name.')
    role = models.CharField(max_length=80, help_text="Shown in bold under the name.")
    department = models.CharField(max_length=80, blank=True)
    qualification = models.CharField(
        max_length=120, blank=True, help_text="Shown beside the accent rule."
    )
    bio = models.TextField(
        max_length=400, blank=True, help_text="Revealed when the card is clicked."
    )
    photo = models.FileField(
        upload_to="people/",
        blank=True,
        validators=[FileExtensionValidator(IMAGE_EXT)],
        help_text="Portrait. Roughly 4:3 works best.",
    )

    class Meta(Ordered.Meta):
        verbose_name_plural = "People"

    def __str__(self):
        return self.name


class Stat(Ordered, TimeStamped):
    """One of the counter tiles under the homepage hero banner."""

    ICONS = [
        ("calendar", "Calendar"),
        ("users", "People"),
        ("award", "Award"),
        ("pin", "Location pin"),
        ("flask", "Science flask"),
        ("palette", "Arts palette"),
    ]

    label = models.CharField(max_length=40, help_text='e.g. "Founded"')
    value = models.IntegerField(help_text="The number it counts to, e.g. 1979.")
    count_from = models.IntegerField(
        null=True,
        blank=True,
        help_text="Leave blank to count up from 0. Set it to count DOWN "
        "(the founding year counts down from the current year).",
    )
    suffix = models.CharField(
        max_length=5, blank=True, help_text='Appended to the number, e.g. "+".'
    )
    grouped = models.BooleanField(
        "Thousands separator",
        default=True,
        help_text="Untick for years, so 1979 does not render as 1,979.",
    )
    icon = models.CharField(max_length=20, choices=ICONS, default="award")

    def __str__(self):
        return f"{self.label}: {self.value}"


class Award(Ordered, TimeStamped):
    """A card in the About page "Awards & Honors" carousel."""

    year = models.CharField(max_length=20, help_text='e.g. "2024-25"')
    title = models.CharField(max_length=80)
    body = models.CharField(
        max_length=120, blank=True, help_text="The awarding body or event."
    )
    image = models.FileField(
        upload_to="awards/",
        blank=True,
        validators=[FileExtensionValidator(IMAGE_EXT)],
    )

    def __str__(self):
        return f"{self.year} — {self.title}"


class Brochure(TimeStamped):
    """The downloadable PDF behind every "Download Brochure" button."""

    title = models.CharField(max_length=80, default="School Brochure")
    file = models.FileField(
        upload_to="brochures/", validators=[FileExtensionValidator(["pdf"])]
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Only one brochure is active at a time. Ticking this "
        "un-ticks the others.",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.is_active:
            Brochure.objects.exclude(pk=self.pk).update(is_active=False)


class SiteSettings(TimeStamped):
    """Singleton: the contact details shown in the footer and Contact page."""

    name = models.CharField(max_length=80, default="Indiranagar Cambridge School")
    address = models.CharField(max_length=200)
    phone = models.CharField(max_length=30)
    mobile = models.CharField(max_length=30, blank=True)
    email = models.EmailField(max_length=120)
    email_hr = models.EmailField("HR email", max_length=120, blank=True)
    hours_week = models.CharField(max_length=60, blank=True)
    hours_sat = models.CharField(max_length=60, blank=True)
    maps_url = models.URLField(max_length=300, blank=True)

    facebook = models.URLField(max_length=200, blank=True)
    instagram = models.URLField(max_length=200, blank=True)
    youtube = models.URLField(max_length=200, blank=True)
    linkedin = models.URLField(max_length=200, blank=True)
    whatsapp = models.URLField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce a single row
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
