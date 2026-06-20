from rest_framework import serializers
from .models import Airport, Airline, Flight


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = ["code", "name", "city", "state"]


class AirlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airline
        fields = ["code", "name"]


class FlightSerializer(serializers.ModelSerializer):
    airline = AirlineSerializer(read_only=True)
    origin = AirportSerializer(read_only=True)
    destination = AirportSerializer(read_only=True)

    class Meta:
        model = Flight
        fields = [
            "id",
            "airline",
            "flight_number",
            "origin",
            "destination",
            "date",
            "departure_time",
            "arrival_time",
            "duration_mins",
            "stops",
            "price",
            "seats_left",
            "cabin_class",
        ]
