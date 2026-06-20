from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def bookings(request):

    if request.method == "GET":
        user_bookings = (
            Booking.objects.filter(user=request.user)
            .select_related("flight")
            .prefetch_related("passengers")
            .order_by("-created_at")
        )
        return Response(BookingSerializer(user_bookings, many=True).data)

    if request.method == "POST":
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def booking_detail(request, ref):
    try:
        booking = Booking.objects.get(booking_ref=ref, user=request.user)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(BookingSerializer(booking).data)
