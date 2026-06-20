from django.urls import path
from . import views

urlpatterns = [
    path("airports/", views.airports, name="airports"),
    path("search/", views.search_flights, name="search_flights"),
]
