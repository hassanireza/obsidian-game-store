import pytest
from django.urls import reverse
from django.contrib.auth.models import User


def test_signup_page_loads(client):
    response = client.get(reverse('signup'))
    assert response.status_code == 200


def test_login_page_loads(client):
    response = client.get(reverse('login'))
    assert response.status_code == 200


def test_wishlist_requires_login(client):
    response = client.get(reverse('wishlist'))
    assert response.status_code == 302  # redirected to login


def test_library_requires_login(client):
    response = client.get(reverse('library'))
    assert response.status_code == 302


def test_profile_requires_login(client):
    response = client.get(reverse('profile'))
    assert response.status_code == 302


@pytest.fixture
def logged_in_client(client, db):
    user = User.objects.create_user(username='tester', password='testpass123')
    client.login(username='tester', password='testpass123')
    return client


def test_profile_view_when_logged_in(logged_in_client):
    response = logged_in_client.get(reverse('profile'))
    assert response.status_code == 200
