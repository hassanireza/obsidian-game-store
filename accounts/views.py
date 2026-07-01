from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import SignupForm
from .models import UserProfile, Wishlist, Library


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = SignupForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        UserProfile.objects.get_or_create(user=user)
        login(request, user)
        messages.success(request, f'Welcome to Obsidian, {user.username}!')
        return redirect('home')
    return render(request, 'accounts/signup.html', {'form': form, 'page': 'signup'})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    next_url = request.GET.get('next', '/')
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        login(request, user)
        messages.success(request, f'Welcome back, {user.username}!')
        return redirect(next_url)
    return render(request, 'accounts/login.html', {'form': form, 'next': next_url, 'page': 'login'})


def logout_view(request):
    logout(request)
    return redirect('home')


@login_required
def wishlist_view(request):
    items = request.user.wishlist.select_related('game', 'game__genre').all()
    return render(request, 'accounts/wishlist.html', {'items': items, 'page': 'wishlist'})


@login_required
def library_view(request):
    items = request.user.library.select_related('game', 'game__genre').order_by('-last_played', '-added_at')
    return render(request, 'accounts/library.html', {'items': items, 'page': 'library'})


@login_required
def profile_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'accounts/profile.html', {
        'profile': profile,
        'wl_count': request.user.wishlist.count(),
        'lib_count': request.user.library.count(),
        'recent': request.user.library.select_related('game').order_by('-last_played')[:4],
        'page': 'profile',
    })
