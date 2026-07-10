from django.db import models
from django.contrib.auth.models import User
from flights.models import Flight


class Booking(models.Model):
    STATUS_CHOICES = [
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE)
    booking_ref = models.CharField(max_length=10, unique=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="confirmed"
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    seats = models.CharField(max_length=100, blank=True)  # e.g. "12A,12B"
    cabin_class = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    # passenger counts
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    infants = models.IntegerField(default=0)
    stripe_payment_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.booking_ref} — {self.user.username}"


class Passenger(models.Model):
    TYPE_CHOICES = [("adult", "Adult"), ("child", "Child"), ("infant", "Infant")]

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="passengers"
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=20)
    dob = models.DateField(null=True, blank=True)
    pax_type = models.CharField(max_length=10, choices=TYPE_CHOICES)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.pax_type})"
