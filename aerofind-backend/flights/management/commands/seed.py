import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from flights.models import Airport, Airline, Flight


class Command(BaseCommand):
    help = "Seed airports, airlines and sample flights"

    def handle(self, *args, **kwargs):
        self.seed_airports()
        self.seed_airlines()
        self.seed_flights()
        self.stdout.write(self.style.SUCCESS("✓ Seed complete."))

    # ─── AIRPORTS ─────────────────────────────────────────────
    def seed_airports(self):
        airports = [
            ("LOS", "Murtala Muhammed International", "Lagos", "Lagos"),
            ("ABV", "Nnamdi Azikiwe International", "Abuja", "FCT"),
            ("KAN", "Mallam Aminu Kano International", "Kano", "Kano"),
            ("PHC", "Port Harcourt International", "Port Harcourt", "Rivers"),
            ("ENU", "Akanu Ibiam International", "Enugu", "Enugu"),
            ("CBQ", "Margaret Ekpo International", "Calabar", "Cross River"),
            ("ILR", "Ilorin International", "Ilorin", "Kwara"),
            ("SKO", "Sadiq Abubakar III International", "Sokoto", "Sokoto"),
            ("BNI", "Benin Airport", "Benin City", "Edo"),
        ]
        for code, name, city, state in airports:
            _, created = Airport.objects.get_or_create(
                code=code, defaults={"name": name, "city": city, "state": state}
            )
            status = "created" if created else "exists"
            self.stdout.write(f"  Airport {code} ({status})")

    # ─── AIRLINES ─────────────────────────────────────────────
    def seed_airlines(self):
        airlines = [
            ("P4", "Air Peace"),
            ("QI", "Ibom Air"),
            ("W3", "Arik Air"),
            ("N2", "Aero Contractors"),
            ("9J", "Dana Air"),
            ("UN", "United Nigeria"),
            ("R4", "Rano Air"),
        ]
        for code, name in airlines:
            _, created = Airline.objects.get_or_create(
                code=code, defaults={"name": name}
            )
            status = "created" if created else "exists"
            self.stdout.write(f"  Airline {name} ({status})")

    # ─── FLIGHTS ──────────────────────────────────────────────
    def seed_flights(self):
        airports = list(Airport.objects.all())
        airlines = list(Airline.objects.all())

        routes = [(o, d) for o in airports for d in airports if o.code != d.code]

        slots = [
            "06:00",
            "07:30",
            "09:00",
            "10:30",
            "12:00",
            "13:30",
            "15:00",
            "16:30",
            "18:00",
            "20:00",
        ]

        def get_duration(origin_code, dest_code):
            long_routes = {
                frozenset(["LOS", "KAN"]),
                frozenset(["LOS", "SKO"]),
                frozenset(["ABV", "PHC"]),
                frozenset(["KAN", "PHC"]),
                frozenset(["SKO", "PHC"]),
                frozenset(["SKO", "ENU"]),
                frozenset(["SKO", "CBQ"]),
            }
            medium_routes = {
                frozenset(["LOS", "ABV"]),
                frozenset(["LOS", "ENU"]),
                frozenset(["LOS", "CBQ"]),
                frozenset(["ABV", "KAN"]),
                frozenset(["ABV", "ENU"]),
                frozenset(["KAN", "ENU"]),
            }
            pair = frozenset([origin_code, dest_code])
            if pair in long_routes:
                return random.randint(85, 110)
            if pair in medium_routes:
                return random.randint(65, 85)
            return random.randint(45, 65)

        def add_minutes(time_str, mins):
            h, m = map(int, time_str.split(":"))
            total = h * 60 + m + mins
            return f"{(total // 60) % 24:02d}:{total % 60:02d}"

        Flight.objects.all().delete()
        self.stdout.write("  Cleared existing flights.")

        today = date.today()
        to_create = []  # collect everything, insert once at the end

        for day_offset in range(14):
            flight_date = today + timedelta(days=day_offset)

            for origin, destination in routes:
                for airline in airlines:
                    num_flights = 1
                    used_slots = random.sample(slots, min(num_flights, len(slots)))

                    for dep_slot in used_slots:
                        duration_mins = get_duration(origin.code, destination.code)
                        arrival_time = add_minutes(dep_slot, duration_mins)
                        stops = 0 if random.random() < 0.8 else 1

                        # economy
                        to_create.append(
                            Flight(
                                airline=airline,
                                flight_number=f"{airline.code}{random.randint(100, 999)}",
                                origin=origin,
                                destination=destination,
                                date=flight_date,
                                departure_time=dep_slot,
                                arrival_time=arrival_time,
                                duration_mins=duration_mins,
                                stops=stops,
                                price=random.randint(35_000, 120_000),
                                seats_left=random.randint(2, 50),
                                cabin_class="economy",
                            )
                        )

                        # business
                        to_create.append(
                            Flight(
                                airline=airline,
                                flight_number=f"{airline.code}{random.randint(100, 999)}",
                                origin=origin,
                                destination=destination,
                                date=flight_date,
                                departure_time=dep_slot,
                                arrival_time=arrival_time,
                                duration_mins=duration_mins,
                                stops=stops,
                                price=random.randint(90_000, 280_000),
                                seats_left=random.randint(2, 20),
                                cabin_class="business",
                            )
                        )

        # ── single bulk insert ──
        Flight.objects.bulk_create(to_create, batch_size=1000)
        self.stdout.write(f"  Created {len(to_create)} flights across 30 days.")
