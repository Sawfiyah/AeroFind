from django.db import models


class Airport(models.Model):
    code = models.CharField(max_length=3, unique=True)  # e.g. LOS
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.city} ({self.code})"


class Airline(models.Model):
    code = models.CharField(max_length=3, unique=True)  # e.g. AT
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Flight(models.Model):
    CLASS_CHOICES = [("economy", "Economy"), ("business", "Business")]

    airline = models.ForeignKey(Airline, on_delete=models.CASCADE)
    flight_number = models.CharField(max_length=10)
    origin = models.ForeignKey(
        Airport, on_delete=models.CASCADE, related_name="departures"
    )
    destination = models.ForeignKey(
        Airport, on_delete=models.CASCADE, related_name="arrivals"
    )
    date = models.DateField()
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    duration_mins = models.IntegerField()
    stops = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seats_left = models.IntegerField(default=50)
    cabin_class = models.CharField(
        max_length=10, choices=CLASS_CHOICES, default="economy"
    )

    def __str__(self):
        return f"{self.flight_number} {self.origin} → {self.destination} ({self.date})"
