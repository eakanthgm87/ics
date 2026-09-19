"""Quick DB inspection:  python check_db.py"""
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from api.models import (Admission, Award, Brochure, Enquiry, GalleryImage,
                        Person, SiteSettings, Stat)

print("-- submissions --")
print("Enquiries :", Enquiry.objects.count())
for e in Enquiry.objects.all()[:5]:
    print(f"   {e.name} | {e.email} | {e.subject}")
print("Admissions:", Admission.objects.count())
for a in Admission.objects.all()[:5]:
    print(f"   {a.full_name} | dob {a.dob} | tc={bool(a.tc)} marks={bool(a.marks)}")

print("-- content --")
for m in (GalleryImage, Person, Stat, Award, Brochure):
    print(f"{m.__name__:14}: {m.objects.count()}")
print("SiteSettings  :", SiteSettings.objects.count())
