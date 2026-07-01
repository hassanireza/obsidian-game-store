from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('store/', views.catalog, name='catalog'),
    path('game/<slug:slug>/', views.game_detail, name='game_detail'),
    path('game/<slug:slug>/play/', views.play_game, name='play_game'),
    path('game/<slug:slug>/wishlist/', views.toggle_wishlist, name='toggle_wishlist'),
    path('game/<slug:slug>/library/', views.toggle_library, name='toggle_library'),
    path('game/<slug:slug>/review/', views.submit_review, name='submit_review'),
]
