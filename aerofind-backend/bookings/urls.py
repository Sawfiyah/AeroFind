from django.urls import path
from . import views

urlpatterns = [
    path("", views.bookings, name="bookings"),
    path("<str:ref>/", views.booking_detail, name="booking_detail"),
]
