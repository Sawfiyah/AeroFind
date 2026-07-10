from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
import stripe
from django.conf import settings
from .email import send_booking_confirmation

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    print("STRIPE KEY:", settings.STRIPE_SECRET_KEY)  # ← add this
    print("REQUEST DATA:", request.data)  # ← and this


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    total_price = request.data.get("total_price")

    if not total_price:
        return Response(
            {"error": "total_price is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Stripe amounts are in the smallest currency unit
        # NGN uses kobo — multiply by 100
        intent = stripe.PaymentIntent.create(
            amount=int(float(total_price) * 100),
            currency="ngn",
            metadata={"integration_check": "accept_a_payment"},
        )
        return Response(
            {
                "client_secret": intent.client_secret,
                "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
            }
        )
    except stripe.error.StripeError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def bookings(request):
    if request.method == "POST":
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save(user=request.user)

            # ── send confirmation email ──
            send_booking_confirmation(booking)

            return Response(
                BookingSerializer(booking).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
