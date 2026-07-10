from rest_framework import serializers
from .models import Booking, Passenger
from flights.serializers import FlightSerializer
import random, string


class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ["first_name", "last_name", "gender", "dob", "pax_type"]


class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True)
    flight = FlightSerializer(read_only=True)
    flight_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_ref",
            "status",
            "total_price",
            "seats",
            "cabin_class",
            "created_at",
            "adults",
            "children",
            "infants",
            "stripe_payment_id",  # ← add this
            "flight",
            "flight_id",
            "passengers",
        ]
        read_only_fields = ["booking_ref", "status", "created_at"]

    def create(self, validated_data):
        passengers_data = validated_data.pop("passengers")

        # generate unique booking ref
        ref = "".join(random.choices(string.ascii_uppercase + string.digits, k=7))
        while Booking.objects.filter(booking_ref=ref).exists():
            ref = "".join(random.choices(string.ascii_uppercase + string.digits, k=7))

        booking = Booking.objects.create(booking_ref=ref, **validated_data)

        for p in passengers_data:
            Passenger.objects.create(booking=booking, **p)

        return booking
