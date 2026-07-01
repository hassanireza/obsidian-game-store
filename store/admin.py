from django.contrib import admin
from .models import Game, Genre, Review

admin.site.site_header = 'Obsidian Game Club Admin'
admin.site.site_title = 'Obsidian Admin'
admin.site.index_title = 'Content Management'


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['name', 'genre', 'is_featured', 'is_trending', 'plays', 'rating']
    list_filter = ['is_featured', 'is_trending', 'is_editors_choice', 'is_new', 'genre']
    search_fields = ['name', 'tagline']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}


admin.site.register(Review)
