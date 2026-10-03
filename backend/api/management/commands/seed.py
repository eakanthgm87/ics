"""
Load the website's built-in content into the database so /admin starts
populated instead of empty.

    python manage.py seed            # safe to run on every deploy
    python manage.py seed --reset    # force a full reload of site content

The content lives in icsw/src/data/content.json, the same file the React app
uses as its fallback, so the two can never drift apart. Images are copied from
icsw/public.

Staff edits survive: content is only (re)loaded when CONTENT_VERSION is newer
than the version recorded in Site settings. Bump CONTENT_VERSION whenever
content.json changes and should replace what is in the database. Form
submissions (enquiries, admissions) are never touched.
"""

import json
import re
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
    AcademicStage,
    Award,
    Chapter,
    Facility,
    GalleryImage,
    PageSection,
    Person,
    Program,
    SiteSettings,
    Stat,
    StageCard,
)

CONTENT_VERSION = 2

FRONTEND = Path(__file__).resolve().parents[4] / "icsw"
CONTENT = FRONTEND / "src" / "data" / "content.json"


def attach(obj, field_name, public_path):
    """Copy a file from icsw/public (e.g. "/images/x.jpg") into a FileField."""
    if not public_path:
        return
    src = FRONTEND / "public" / public_path.lstrip("/")
    if src.exists():
        with src.open("rb") as fh:
            getattr(obj, field_name).save(src.name, File(fh), save=True)


class Command(BaseCommand):
    help = "Populate the database with the site's built-in content."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true", help="Reload content even if up to date."
        )

    def handle(self, *args, reset=False, **options):
        settings = SiteSettings.load()
        if settings.content_version >= CONTENT_VERSION and not reset:
            self.stdout.write("Content is up to date; leaving staff edits alone.")
        else:
            data = json.loads(CONTENT.read_text(encoding="utf-8"))
            with transaction.atomic():
                self.load(data)
                self.load_settings(settings)
            self.stdout.write(self.style.SUCCESS(f"Seeded content version {CONTENT_VERSION}."))
        self.restore_missing()

    def restore_missing(self):
        """
        Hosts like Render rebuild from a fresh checkout, so media/ starts empty
        on every deploy while the database still points at the files. Put back
        any file that came from icsw/public. (Files staff uploaded themselves
        cannot be recovered this way; they need persistent storage.)
        """
        bundled = {p.name: p for p in (FRONTEND / "public" / "images").rglob("*") if p.is_file()}
        fields = [(PageSection, "image"), (GalleryImage, "image"), (Person, "photo"),
                  (Award, "image"), (Facility, "image"), (AcademicStage, "image"),
                  (Chapter, "image")]
        restored = missing = 0
        for model, name in fields:
            for obj in model.objects.exclude(**{name: ""}):
                f = getattr(obj, name)
                if f.storage.exists(f.name):
                    continue
                base = Path(f.name).name
                # Django adds "_abc1234" when a name was taken; try without it
                src = bundled.get(base) or bundled.get(
                    re.sub(r"_[A-Za-z0-9]{7}(\.\w+)$", r"\1", base))
                if src:
                    with src.open("rb") as fh:
                        f.storage.save(f.name, File(fh))
                    restored += 1
                else:
                    missing += 1
        if restored or missing:
            self.stdout.write(f"media        : {restored} restored, {missing} uploads missing")

    def load(self, data):
        for model in (PageSection, GalleryImage, Person, Stat, Award, Program,
                      Facility, AcademicStage, Chapter):
            model.objects.all().delete()

        for key, s in data["sections"].items():
            obj = PageSection.objects.create(
                key=key, label=s["label"], eyebrow=s.get("eyebrow", ""),
                title=s.get("title", ""), subtitle=s.get("subtitle", ""),
                body=s.get("body", ""), quote=s.get("quote", ""),
            )
            attach(obj, "image", s.get("img"))

        for i, g in enumerate(data["gallery"]):
            obj = GalleryImage.objects.create(
                title=g["title"], caption=g["caption"], category=g["cat"],
                size=g["span"], order=i,
            )
            attach(obj, "image", g["src"])

        for i, p in enumerate(data["people"]):
            obj = Person.objects.create(
                name=p["name"], role=p["role"], department=p.get("dept", ""),
                qualification=p.get("qual", ""), experience=p.get("exp", ""),
                bio=p.get("bio", ""), order=i,
            )
            attach(obj, "photo", p.get("img"))

        for i, s in enumerate(data["stats"]):
            Stat.objects.create(
                label=s["label"], value=s["to"], count_from=s.get("from"),
                grouped=s.get("grouped", True), icon=s["icon"], order=i,
            )

        for i, a in enumerate(data["awards"]):
            obj = Award.objects.create(year=a["year"], title=a["title"],
                                       body=a.get("body", ""), order=i)
            attach(obj, "image", a.get("img"))

        for i, p in enumerate(data["programs"]):
            Program.objects.create(title=p["title"], text=p["text"], link=p["to"],
                                   icon=p["icon"], order=i)

        for i, f in enumerate(data["facilities"]):
            obj = Facility.objects.create(
                title=f["title"], text=f.get("text", ""), tagline=f.get("tagline", ""),
                alt=f.get("alt", ""), order=i,
            )
            attach(obj, "image", f.get("img"))

        for i, s in enumerate(data["stages"]):
            obj = AcademicStage.objects.create(title=s["title"], text=s["text"],
                                               alt=s.get("alt", ""), order=i)
            attach(obj, "image", s.get("img"))
            for j, c in enumerate(s["cards"]):
                StageCard.objects.create(stage=obj, order=j, **c)

        for i, c in enumerate(data["chapters"]):
            obj = Chapter.objects.create(
                title=c["title"], text=c["text"], tag=c.get("tag", ""),
                badge=c.get("badge", ""), alt=c.get("alt", ""), order=i,
            )
            attach(obj, "image", c.get("img"))

        for model in (PageSection, GalleryImage, Person, Award, Facility,
                      AcademicStage, Chapter):
            self.stdout.write(f"  {model._meta.verbose_name_plural:<22}: "
                              f"{model.objects.count()}")

    def load_settings(self, s):
        s.name = "Indiranagar Cambridge School"
        s.address = "#52, 6th Cross, 8th Main Rd, HAL 3rd Stage, Bengaluru 560075"
        s.phone = "080-25215207"
        s.mobile = "+91 99020 76777"
        s.email = "indiranagarcambridgeschool@gmail.com"
        s.email_hr = "hr.indiranagarcambridgeschool@gmail.com"
        s.hours_week = "Mon - Fri: 8:30 AM to 4:00 PM"
        s.hours_sat = "Sat: 9:00 AM to 12:30 PM"
        s.maps_url = "https://maps.app.goo.gl/pdQwJhK4u2YYb8Lv6"
        s.facebook = s.facebook or "https://www.facebook.com/p/The-Indiranagar-cambridge-school-100066308185320/"
        s.whatsapp = "https://wa.me/919902076777"
        s.notify_emails = s.notify_emails or "indiranagarcambridgeschool@gmail.com"
        s.content_version = CONTENT_VERSION
        s.save()
