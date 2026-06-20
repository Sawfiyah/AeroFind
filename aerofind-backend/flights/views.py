from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Airport, Flight
from .serializers import AirportSerializer, FlightSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def airports(request):
    data = Airport.objects.all().order_by("city")
    return Response(AirportSerializer(data, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def search_flights(request):
    origin = request.query_params.get("origin")
    destination = request.query_params.get("destination")
    date = request.query_params.get("date")
    cabin_class = request.query_params.get("cabin_class", "economy")

    if not all([origin, destination, date]):
        return Response(
            {"error": "origin, destination and date are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    flights = Flight.objects.filter(
        origin__code=origin,
        destination__code=destination,
        date=date,
        cabin_class=cabin_class,
    ).select_related("airline", "origin", "destination")

    return Response(FlightSerializer(flights, many=True).data)
