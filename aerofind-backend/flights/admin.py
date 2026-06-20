from django.contrib import admin
from .models import Airport, Airline, Flight

admin.site.register(Airport)
admin.site.register(Airline)
admin.site.register(Flight)
