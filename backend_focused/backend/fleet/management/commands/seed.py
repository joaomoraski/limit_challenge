import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils.timezone import now
from faker import Faker

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle

fake = Faker()

OFFICES = [
    ("New York HQ", "New York"),
    ("Chicago Branch", "Chicago"),
    ("Los Angeles Hub", "Los Angeles"),
    ("Houston Office", "Houston"),
    ("Phoenix Center", "Phoenix"),
]

MAKES_MODELS = [
    ("Toyota", ["Camry", "Corolla", "RAV4", "Highlander"]),
    ("Ford", ["F-150", "Explorer", "Mustang", "Escape"]),
    ("Honda", ["Civic", "Accord", "CR-V", "Pilot"]),
    ("Chevrolet", ["Silverado", "Equinox", "Malibu", "Tahoe"]),
    ("BMW", ["3 Series", "X5", "X3", "5 Series"]),
]

MAINTENANCE_TYPES = {
    "Oil Change": (40, 90),
    "Tire Rotation": (30, 60),
    "Brake Inspection": (100, 300),
    "Engine Tune-up": (200, 500),
    "Transmission Service": (150, 400),
    "Battery Replacement": (100, 250),
    "Alignment": (75, 150),
    "AC Service": (100, 300),
}


class Command(BaseCommand):
    help = "Populate the database with realistic dummy data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            MaintenanceRecord.objects.all().delete()
            Vehicle.objects.all().delete()
            Mechanic.objects.all().delete()
            Office.objects.all().delete()
            self.stdout.write("Cleared existing data.")

        offices = self._create_offices()
        mechanics = self._create_mechanics()
        vehicles = self._create_vehicles(offices)
        records = self._create_maintenance_records(vehicles, mechanics)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded: {len(offices)} offices, {len(vehicles)} vehicles, "
            f"{len(mechanics)} mechanics, {len(records)} maintenance records"
        ))

    def _create_offices(self):
        offices = []
        for name, city in OFFICES:
            office, _ = Office.objects.get_or_create(name=name, defaults={"city": city})
            offices.append(office)
        return offices

    def _create_mechanics(self):
        mechanics = []
        for i in range(10):
            mechanic, _ = Mechanic.objects.get_or_create(
                certification_number=f"MECH-{i + 1:04d}",
                defaults={
                    "name": fake.name(),
                    "is_active": i < 9,
                },
            )
            mechanics.append(mechanic)
        return mechanics

    def _create_vehicles(self, offices):
        vehicles = []
        for i in range(30):
            make, models = random.choice(MAKES_MODELS)
            vehicle = Vehicle.objects.create(
                vin=fake.unique.bothify("?####??#?########"),
                license_plate=fake.unique.bothify("???-####"),
                make=make,
                model=random.choice(models),
                year=random.randint(2016, 2025),
                office=random.choice(offices),
                is_active=i >= 3,  # first 3 are inactive
            )
            vehicles.append(vehicle)
        return vehicles

    def _create_maintenance_records(self, vehicles, mechanics):
        active_mechanics = [m for m in mechanics if m.is_active]
        records = []
        today = now().date()
        two_years_ago = today - timedelta(days=730)

        for vehicle in vehicles:
            num_records = random.randint(0, 8)
            for _ in range(num_records):
                mtype = random.choice(list(MAINTENANCE_TYPES.keys()))
                cost_min, cost_max = MAINTENANCE_TYPES[mtype]
                days_offset = random.randint(0, 730)
                record = MaintenanceRecord(
                    vehicle=vehicle,
                    mechanic=random.choice(active_mechanics),
                    maintenance_date=two_years_ago + timedelta(days=days_offset),
                    maintenance_type=mtype,
                    cost=round(random.uniform(cost_min, cost_max), 2),
                    notes=fake.sentence() if random.random() > 0.5 else "",
                )
                records.append(record)

        MaintenanceRecord.objects.bulk_create(records)
        return records
