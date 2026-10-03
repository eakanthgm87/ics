from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

admin.site.site_header = "Indiranagar Cambridge School"
admin.site.site_title = "ICS admin"
admin.site.index_title = "Website content & submissions"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    # Uploaded media, in DEBUG *and* production. Django's static() helper is a
    # no-op when DEBUG is off, which left every photo 404ing on Render.
    # ponytail: Django serving files is fine at a school site's traffic; move
    # MEDIA to Cloudinary/S3 if it ever gets heavy.
    re_path(
        rf"^{settings.MEDIA_URL.strip('/')}/(?P<path>.*)$",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]
