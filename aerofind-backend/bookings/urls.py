from django.urls import path
from . import views

urlpatterns = [
    path("", views.bookings, name="bookings"),
    path(
        "create-payment-intent/",
        views.create_payment_intent,
        name="create_payment_intent",
    ),
    path("<str:ref>/", views.booking_detail, name="booking_detail"),
]
