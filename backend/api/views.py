"""
API views.

Public reads are plain list endpoints; the two writes are throttled and fire
best-effort notifications after a successful save.
"""

import logging

from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Award, Brochure, GalleryImage, Person, SiteSettings, Stat
from .notifications import notify_admission, notify_enquiry
from .serializers import (
    AdmissionSerializer,
    AwardSerializer,
    BrochureSerializer,
    EnquirySerializer,
    GallerySerializer,
    PersonSerializer,
    SiteSettingsSerializer,
    StatSerializer,
)

log = logging.getLogger(__name__)


class FormThrottle(AnonRateThrottle):
    """Tighter bucket for the two public write endpoints."""

    scope = "forms"


def flatten_errors(errors):
    """
    DRF gives {"email": ["msg"]}; the React forms expect {"email": "msg"}.
    Matching that shape means server-side errors render with no extra UI work.
    """
    out = {}
    for field, val in errors.items():
        if isinstance(val, (list, tuple)):
            out[field] = str(val[0]) if val else "Invalid value"
        elif isinstance(val, dict):
            out[field] = next(iter(flatten_errors(val).values()), "Invalid value")
        else:
            out[field] = str(val)
    return out


class _SubmitView(generics.CreateAPIView):
    throttle_classes = [FormThrottle]
    notify = staticmethod(lambda obj: None)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": flatten_errors(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        obj = serializer.save()
        # never let a mail/WhatsApp failure lose a submission
        try:
            self.notify(obj)
        except Exception:
            log.exception("Notification failed for %s %s", type(obj).__name__, obj.pk)
        return Response({"id": obj.pk}, status=status.HTTP_201_CREATED)


class EnquiryCreate(_SubmitView):
    serializer_class = EnquirySerializer
    notify = staticmethod(notify_enquiry)


class AdmissionCreate(_SubmitView):
    serializer_class = AdmissionSerializer
    notify = staticmethod(notify_admission)


# ------------------------------------------------------------ content reads


class GalleryList(generics.ListAPIView):
    serializer_class = GallerySerializer
    queryset = GalleryImage.objects.filter(is_published=True)


class PersonList(generics.ListAPIView):
    serializer_class = PersonSerializer
    queryset = Person.objects.filter(is_published=True)


class StatList(generics.ListAPIView):
    serializer_class = StatSerializer
    queryset = Stat.objects.filter(is_published=True)


class AwardList(generics.ListAPIView):
    serializer_class = AwardSerializer
    queryset = Award.objects.filter(is_published=True)


@api_view(["GET"])
def brochure(request):
    obj = Brochure.objects.filter(is_active=True).first()
    if not obj:
        return Response({}, status=status.HTTP_404_NOT_FOUND)
    return Response(BrochureSerializer(obj, context={"request": request}).data)


@api_view(["GET"])
def site_settings(request):
    return Response(
        SiteSettingsSerializer(SiteSettings.load(), context={"request": request}).data
    )


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})
