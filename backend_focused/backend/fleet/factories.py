import factory
from factory.django import DjangoModelFactory

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle


class OfficeFactory(DjangoModelFactory):
    class Meta:
        model = Office

    name = factory.Faker("company")
    city = factory.Faker("city")


class VehicleFactory(DjangoModelFactory):
    class Meta:
        model = Vehicle

    vin = factory.Sequence(lambda n: f"1HGBH41JXMN{n:06d}")
    license_plate = factory.Sequence(lambda n: f"ABC-{n:04d}")
    make = factory.Faker("random_element", elements=["Toyota", "Ford", "Honda", "Chevrolet", "BMW"])
    model = factory.Faker("random_element", elements=["Sedan", "SUV", "Truck", "Coupe", "Van"])
    year = factory.Faker("random_int", min=2015, max=2025)
    office = factory.SubFactory(OfficeFactory)
    is_active = True

    class Params:
        inactive = factory.Trait(is_active=False)


class MechanicFactory(DjangoModelFactory):
    class Meta:
        model = Mechanic

    name = factory.Faker("name")
    certification_number = factory.Sequence(lambda n: f"CERT-{n:06d}")
    is_active = True


class MaintenanceRecordFactory(DjangoModelFactory):
    class Meta:
        model = MaintenanceRecord

    vehicle = factory.SubFactory(VehicleFactory)
    mechanic = factory.SubFactory(MechanicFactory)
    maintenance_date = factory.Faker("date_between", start_date="-2y", end_date="today")
    maintenance_type = factory.Faker(
        "random_element",
        elements=["Oil Change", "Tire Rotation", "Brake Inspection", "Engine Tune-up"],
    )
    cost = factory.Faker("pydecimal", left_digits=4, right_digits=2, positive=True, max_value=2000)
    notes = ""
