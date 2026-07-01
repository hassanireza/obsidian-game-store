from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand

from store.models import Game, Genre


class Command(BaseCommand):
    """Load the initial catalog fixture, but only if the DB is empty.

    Safe to run on every deploy: real platforms shouldn't re-seed (or
    crash on duplicate-key errors) once an admin has started editing
    live data through /admin/.
    """
    help = 'Seed the database with the initial game catalog if it is empty.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Reload the fixture even if games already exist.',
        )

    def handle(self, *args, **options):
        if Genre.objects.exists() or Game.objects.exists():
            if not options['force']:
                self.stdout.write(self.style.SUCCESS(
                    'Catalog already has data — skipping seed (use --force to reload).'
                ))
                return
            self.stdout.write(self.style.WARNING('--force passed: reloading fixture over existing data.'))

        fixture_path = Path(settings.BASE_DIR) / 'fixtures' / 'initial_data.json'
        if not fixture_path.exists():
            self.stdout.write(self.style.ERROR(f'Fixture not found at {fixture_path}'))
            return

        call_command('loaddata', str(fixture_path))
        self.stdout.write(self.style.SUCCESS(
            f'Seeded catalog: {Genre.objects.count()} genres, {Game.objects.count()} games.'
        ))
