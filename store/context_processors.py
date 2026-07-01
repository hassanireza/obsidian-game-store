from django.conf import settings
from store.models import Genre
from django.db.models import Count


def global_context(request):
    genres = Genre.objects.annotate(c=Count('games')).filter(c__gt=0)
    wl_count = lib_count = 0
    if request.user.is_authenticated:
        wl_count = request.user.wishlist.count()
        lib_count = request.user.library.count()
    return {
        'nav_genres': genres,
        'nav_wl': wl_count,
        'nav_lib': lib_count,
        'SITE_NAME': settings.SITE_NAME,
        'SITE_TAGLINE': settings.SITE_TAGLINE,
        'SITE_FULL_NAME': settings.SITE_FULL_NAME,
    }
