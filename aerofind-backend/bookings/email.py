from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_booking_confirmation(booking):
    subject = f"AeroFind Booking Confirmed — {booking.booking_ref}"

    # plain text version
    message = f"""
Hi {booking.user.first_name},

Your booking is confirmed! ✈

Booking Reference: {booking.booking_ref}
Route:             {booking.flight.origin.city} → {booking.flight.destination.city}
Date:              {booking.flight.date}
Flight:            {booking.flight.flight_number}
Class:             {booking.cabin_class.title()}
Passengers:        {booking.adults + booking.children + booking.infants}
Total Paid:        ₦{booking.total_price:,.0f}

Please arrive at the airport at least 90 minutes before departure.

Thank you for flying with AeroFind.
Safe travels!

— The AeroFind Team
    """.strip()

    # HTML version
    html_message = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">

  <div style="background: #185FA5; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">✈ AeroFind</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0;">Booking Confirmed</p>
  </div>

  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Hi <strong>{booking.user.first_name}</strong>,</p>
    <p>Your booking is confirmed! Here are your details:</p>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">

      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background: #E6F1FB; color: #185FA5; padding: 8px 20px; border-radius: 20px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">
          {booking.booking_ref}
        </span>
        <p style="color: #6b7280; font-size: 13px; margin-top: 6px;">Booking Reference</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Route</td>
          <td style="padding: 10px 0; font-weight: 500; text-align: right;">
            {booking.flight.origin.city} → {booking.flight.destination.city}
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Date</td>
          <td style="padding: 10px 0; font-weight: 500; text-align: right;">{booking.flight.date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Flight</td>
          <td style="padding: 10px 0; font-weight: 500; text-align: right;">{booking.flight.flight_number}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Class</td>
          <td style="padding: 10px 0; font-weight: 500; text-align: right;">{booking.cabin_class.title()}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Passengers</td>
          <td style="padding: 10px 0; font-weight: 500; text-align: right;">
            {booking.adults + booking.children + booking.infants}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Total Paid</td>
          <td style="padding: 10px 0; font-weight: 700; font-size: 16px; color: #185FA5; text-align: right;">
            ₦{booking.total_price:,.0f}
          </td>
        </tr>
      </table>
    </div>

    <div style="background: #fef3c7; border: 1px solid #d97706; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 13px; color: #92400e;">
        ⏰ Please arrive at the airport <strong>at least 90 minutes</strong> before departure.
        Check-in closes 45 minutes before departure.
      </p>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      Thank you for choosing AeroFind. Safe travels! ✈
    </p>
  </div>

  <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
    © 2026 AeroFind · Connecting Nigeria, One Flight at a Time
  </div>

</body>
</html>
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        # log the error but don't crash the booking
        print(f"Email send failed: {e}")
