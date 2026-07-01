from django.db import models
from django.contrib.auth.models import User


class Genre(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=10, default='🎮')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Game(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=300)
    description = models.TextField()
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, related_name='games')
    developer = models.CharField(max_length=200, default='Obsidian Originals')
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    is_editors_choice = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    plays = models.PositiveIntegerField(default=0)
    rating = models.FloatField(default=4.5)
    review_count = models.PositiveIntegerField(default=0)
    # Colours used for gradient placeholders and accents
    color_from = models.CharField(max_length=20, default='#7C5CFF')
    color_to = models.CharField(max_length=20, default='#00CFFF')
    # Asset paths relative to games_static root
    thumbnail = models.CharField(max_length=500, blank=True,
        help_text='Path relative to games_static, e.g. nightCityDivination/assets/banner.webp')
    banner = models.CharField(max_length=500, blank=True)
    # The game entry point
    game_folder = models.CharField(max_length=300,
        help_text='Path relative to games_static root, e.g. nightCityDivination')
    game_entry = models.CharField(max_length=100, default='index.html')
    release_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-plays']

    def __str__(self):
        return self.name

    def thumbnail_url(self):
        if self.thumbnail:
            return f'/static/games/{self.thumbnail}'
        return None

    def banner_url(self):
        if self.banner:
            return f'/static/games/{self.banner}'
        return self.thumbnail_url()

    def play_url(self):
        return f'/game/{self.slug}/play/'

    def rating_int(self):
        return round(self.rating)


class Review(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(default=5)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['game', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} on {self.game.name}'
