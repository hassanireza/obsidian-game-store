import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_signup_page_loads(client):
    response = client.get(reverse('signup'))
    assert response.status_code == 200


@pytest.mark.django_db
def test_login_page_loads(client):
    response = client.get(reverse('login'))
    assert response.status_code == 200
