from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Q, Count
from django.utils import timezone
from .models import Game, Genre, Review
from accounts.models import Wishlist, Library
import json


def _user_sets(request):
    wl, lib = set(), set()
    if request.user.is_authenticated:
        wl = set(request.user.wishlist.values_list('game_id', flat=True))
        lib = set(request.user.library.values_list('game_id', flat=True))
    return wl, lib


def home(request):
    featured = Game.objects.filter(is_featured=True).order_by('-plays')
    trending = Game.objects.filter(is_trending=True).order_by('-plays')[:8]
    editors = Game.objects.filter(is_editors_choice=True).order_by('-plays')[:6]
    new_games = Game.objects.filter(is_new=True).order_by('-plays')[:6]
    all_games = Game.objects.all().order_by('-plays')
    genres = Genre.objects.annotate(c=Count('games')).filter(c__gt=0)
    wl, lib = _user_sets(request)
    return render(request, 'home.html', {
        'featured': featured, 'trending': trending, 'editors': editors,
        'new_games': new_games, 'all_games': all_games, 'genres': genres,
        'wishlist_ids': wl, 'library_ids': lib, 'page': 'home',
    })


def catalog(request):
    games = Game.objects.select_related('genre').all()
    genres = Genre.objects.annotate(c=Count('games')).filter(c__gt=0)
    q = request.GET.get('q', '').strip()
    genre_slug = request.GET.get('genre', '')
    sort = request.GET.get('sort', 'popular')
    if q:
        games = games.filter(Q(name__icontains=q) | Q(description__icontains=q) | Q(tagline__icontains=q))
    if genre_slug:
        games = games.filter(genre__slug=genre_slug)
    sort_map = {'popular': '-plays', 'rating': '-rating', 'newest': '-release_date', 'az': 'name'}
    games = games.order_by(sort_map.get(sort, '-plays'))
    wl, lib = _user_sets(request)
    return render(request, 'store/catalog.html', {
        'games': games, 'genres': genres, 'q': q, 'sort': sort,
        'genre_slug': genre_slug, 'wishlist_ids': wl, 'library_ids': lib,
        'total': games.count(), 'page': 'store',
    })


def game_detail(request, slug):
    game = get_object_or_404(Game, slug=slug)
    related = Game.objects.filter(genre=game.genre).exclude(pk=game.pk)[:4]
    reviews = game.reviews.select_related('user').all()[:8]
    in_wl = in_lib = False
    if request.user.is_authenticated:
        in_wl = request.user.wishlist.filter(game=game).exists()
        in_lib = request.user.library.filter(game=game).exists()
    return render(request, 'store/game_detail.html', {
        'game': game, 'related': related, 'reviews': reviews,
        'in_wl': in_wl, 'in_lib': in_lib, 'page': 'store',
    })


def play_game(request, slug):
    game = get_object_or_404(Game, slug=slug)
    Game.objects.filter(pk=game.pk).update(plays=game.plays + 1)
    if request.user.is_authenticated:
        entry, _ = Library.objects.get_or_create(user=request.user, game=game)
        entry.play_count += 1
        entry.last_played = timezone.now()
        entry.save(update_fields=['play_count', 'last_played'])
    game_url = f'/static/games/{game.game_folder}/{game.game_entry}'
    return render(request, 'store/play.html', {'game': game, 'game_url': game_url, 'page': 'play'})


@require_POST
def toggle_wishlist(request, slug):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'login_required'}, status=401)
    game = get_object_or_404(Game, slug=slug)
    obj, created = Wishlist.objects.get_or_create(user=request.user, game=game)
    if not created:
        obj.delete()
        return JsonResponse({'status': 'removed', 'msg': f'Removed from Wishlist'})
    return JsonResponse({'status': 'added', 'msg': f'Added to Wishlist'})


@require_POST
def toggle_library(request, slug):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'login_required'}, status=401)
    game = get_object_or_404(Game, slug=slug)
    obj, created = Library.objects.get_or_create(user=request.user, game=game)
    if not created:
        obj.delete()
        return JsonResponse({'status': 'removed', 'msg': 'Removed from Library'})
    return JsonResponse({'status': 'added', 'msg': 'Added to Library'})


@require_POST
def submit_review(request, slug):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'login_required'}, status=401)
    game = get_object_or_404(Game, slug=slug)
    try:
        data = json.loads(request.body)
        rating = int(data.get('rating', 0))
        body = data.get('body', '').strip()
        if not (1 <= rating <= 5) or len(body) < 5:
            return JsonResponse({'error': 'Invalid data'}, status=400)
        r, created = Review.objects.update_or_create(
            game=game, user=request.user, defaults={'rating': rating, 'body': body}
        )
        from django.db.models import Avg
        avg = game.reviews.aggregate(a=Avg('rating'))['a'] or rating
        Game.objects.filter(pk=game.pk).update(rating=round(avg, 1), review_count=game.reviews.count())
        return JsonResponse({'status': 'ok', 'username': request.user.username, 'rating': rating, 'body': body})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
