from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Indiranagar Cambridge School"
admin.site.site_title = "ICS admin"
admin.site.index_title = "Website content & submissions"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]

# In DEBUG Django serves uploads itself. In production WhiteNoise serves
# static/, and MEDIA is served by the block below (fine for this traffic level;
# move to S3/Cloudinary if uploads ever get heavy).
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
