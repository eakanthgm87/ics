"""
Seed the database with the content currently hardcoded in the React frontend,
so /admin is populated on a fresh install instead of empty.

    python manage.py seed

Idempotent: re-running updates the existing rows rather than duplicating them.
Images are referenced by the filenames already in the frontend's public/images
folder — staff replace them by uploading real photos in the admin.
"""

from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from api.models import Award, GalleryImage, Person, SiteSettings, Stat

# The frontend ships placeholder artwork; copy it in so seeded rows are not
# blank. Staff replace these by uploading real photos in the admin.
FRONTEND_IMAGES = Path(__file__).resolve().parents[4] / "icsw" / "public" / "images"


def attach(obj, field_name, filename):
    """Attach a frontend placeholder to a FileField, if it isn't set already."""
    field = getattr(obj, field_name)
    if field:
        return False
    src = FRONTEND_IMAGES / filename
    if not src.exists():
        return False
    with src.open("rb") as fh:
        field.save(filename, File(fh), save=True)
    return True

GALLERY = [
    ("School Orchestra", "The senior orchestra rehearsing for the annual concert.", "Events", "tall", "gal-orchestra.svg"),
    ("Campus Life", "Morning arrivals outside the main academic block.", "Campus", "short", "gal-campus-life.svg"),
    ("Athletics Meet", "Inter-house track finals on the synthetic running track.", "Sports", "mid", "gal-sports.svg"),
    ("Central Library", "Quiet study hours in the school library and reading room.", "Academics", "tall", "gal-library.svg"),
    ("Art Studio", "Grade 6 students at work in the visual arts studio.", "Academics", "short", "gal-art-studio.svg"),
    ("Science Laboratory", "Practical chemistry session for the middle school.", "Academics", "mid", "gal-science-lab.svg"),
    ("Debate Club", "Youth parliament mock session in the seminar room.", "Events", "short", "gal-debate.svg"),
    ("Annual Theatre", "The senior school production on the main stage.", "Events", "tall", "gal-theatre.svg"),
    ("Heritage Archway", "The original 1986 archway at the HAL 3rd Stage campus.", "Campus", "short", "gal-campus-detail.svg"),
]

PEOPLE = [
    ("Science Faculty", "Physics · Chemistry · Biology", "Middle & High School",
     "Three dedicated laboratories",
     "Laboratories equipped with the apparatus, instruments and materials needed to run practical work across all three science streams."),
    ("Mathematics Faculty", "Numeracy & Problem Solving", "Nursery to Grade 10",
     "KSEEB syllabus",
     "Builds numeracy from early play-based counting through to board-level problem solving, including Vedic mathematics in the library collection."),
    ("Languages Faculty", "English · Hindi · Kannada", "Nursery to Grade 10",
     "English medium of instruction",
     "Literature in all three languages is stocked in the school library to encourage independent reading and a lifelong passion for books."),
    ("Computer Faculty", "Digital Literacy", "Computer Laboratory",
     "Licensed software throughout",
     "Students get hands-on lab access three times a week, working with educational and office application software on desktop machines."),
    ("Physical Education", "Sports & Games", "All grades",
     "Host of the annual Swift meet",
     "Cricket, kho kho, badminton, chess, kabaddi, throwball and volleyball, culminating in the inter-class and inter-house Swift competitions."),
]

STATS = [
    ("Founded", 1979, 2026, "", False, "calendar"),
    ("Students in 1979", 7, None, "", True, "users"),
    ("Grades: Nursery to 10", 10, None, "", True, "award"),
    ("First Class X Batch", 1989, None, "", False, "pin"),
]

AWARDS = [
    ("2024-25", "Swift Awards", "Annual inter-house and inter-class sports meet"),
    ("2023-24", "JB Nagar Cluster Sports", "Inter-school cluster competitions"),
    ("2019-20", "Healthy School Award", "Recognised for student health and wellbeing"),
    ("2017-18", "JB Nagar Cluster Sports", "Inter-school cluster competitions"),
    ("2016-17", "JB Nagar Cluster Sports", "Inter-school cluster competitions"),
    ("2012-13", "JB Nagar Cluster Sports", "Inter-school cluster competitions"),
]


class Command(BaseCommand):
    help = "Populate the database with the site's current content."

    def handle(self, *args, **options):
        attached = 0
        for i, (title, caption, cat, size, filename) in enumerate(GALLERY):
            obj, _ = GalleryImage.objects.update_or_create(
                title=title,
                defaults={"caption": caption, "category": cat, "size": size, "order": i},
            )
            attached += attach(obj, "image", filename)
        self.stdout.write(
            f"gallery      : {GalleryImage.objects.count()} ({attached} images attached)"
        )

        for i, (name, role, dept, qual, bio) in enumerate(PEOPLE):
            obj, _ = Person.objects.update_or_create(
                name=name,
                defaults={"role": role, "department": dept, "qualification": qual,
                          "bio": bio, "order": i},
            )
            attach(obj, "photo", f"faculty-{i + 1}.svg")
        self.stdout.write(f"people       : {Person.objects.count()}")

        for i, (label, value, cfrom, suffix, grouped, icon) in enumerate(STATS):
            Stat.objects.update_or_create(
                label=label,
                defaults={"value": value, "count_from": cfrom, "suffix": suffix,
                          "grouped": grouped, "icon": icon, "order": i},
            )
        self.stdout.write(f"stats        : {Stat.objects.count()}")

        for i, (year, title, body) in enumerate(AWARDS):
            obj, _ = Award.objects.update_or_create(
                year=year, title=title, defaults={"body": body, "order": i},
            )
            attach(obj, "image", f"award-{(i % 4) + 1}.svg")
        self.stdout.write(f"awards       : {Award.objects.count()}")

        s = SiteSettings.load()
        s.name = "Indiranagar Cambridge School"
        s.address = "#52, 6th Cross, 8th Main Rd, HAL 3rd Stage, Bengaluru 560075"
        s.phone = "080-25215207"
        s.mobile = "+91 99020 76777"
        s.email = "indiranagarcambridgeschool@gmail.com"
        s.email_hr = "hr.indiranagarcambridgeschool@gmail.com"
        s.hours_week = "Mon - Fri: 8:30 AM to 4:00 PM"
        s.hours_sat = "Sat: 9:00 AM to 12:30 PM"
        s.maps_url = "https://maps.app.goo.gl/pdQwJhK4u2YYb8Lv6"
        s.whatsapp = "https://wa.me/919902076777"
        s.save()
        self.stdout.write("site settings: saved")

        self.stdout.write(self.style.SUCCESS("Seed complete."))
