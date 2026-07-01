from django.db import models
from django.contrib.auth.models import User
from store.models import Game


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)

    def __str__(self):
        return f'{self.user.username}'

    def initials(self):
        u = self.user
        if u.first_name and u.last_name:
            return f'{u.first_name[0]}{u.last_name[0]}'.upper()
        return u.username[:2].upper()


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'game']
        ordering = ['-added_at']


class Library(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='library')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='in_library')
    added_at = models.DateTimeField(auto_now_add=True)
    last_played = models.DateTimeField(null=True, blank=True)
    play_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['user', 'game']
        ordering = ['-last_played', '-added_at']
