from django.urls import path

from . import views

urlpatterns = [
    # writes (public forms)
    path("enquiries/", views.EnquiryCreate.as_view(), name="enquiry-create"),
    path("admissions/", views.AdmissionCreate.as_view(), name="admission-create"),
    # reads (site content, all admin-editable)
    path("gallery/", views.GalleryList.as_view(), name="gallery-list"),
    path("people/", views.PersonList.as_view(), name="people-list"),
    path("stats/", views.StatList.as_view(), name="stat-list"),
    path("awards/", views.AwardList.as_view(), name="award-list"),
    path("brochure/", views.brochure, name="brochure"),
    path("settings/", views.site_settings, name="site-settings"),
    path("health/", views.health, name="health"),
]
