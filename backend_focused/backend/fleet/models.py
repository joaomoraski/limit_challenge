from django.core.validators import MinValueValidator
from django.db import models


class Office(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=200)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    vin = models.CharField("VIN", max_length=17, unique=True)
    license_plate = models.CharField(max_length=20)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveSmallIntegerField()
    office = models.ForeignKey(
        Office,
        on_delete=models.PROTECT,
        related_name="vehicles",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["make", "model"]
        constraints = [
            models.UniqueConstraint(
                fields=["license_plate"],
                condition=models.Q(is_active=True),
                name="unique_active_license_plate",
            ),
        ]

    def save(self, *args, **kwargs):
        self.vin = self.vin.upper()
        self.license_plate = self.license_plate.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"


class Mechanic(models.Model):
    name = models.CharField(max_length=200)
    certification_number = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class MaintenanceRecord(models.Model):
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="maintenance_records",
    )
    mechanic = models.ForeignKey(
        Mechanic,
        on_delete=models.PROTECT,
        related_name="maintenance_records",
    )
    maintenance_date = models.DateField()
    maintenance_type = models.CharField(max_length=100)
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-maintenance_date"]
        indexes = [
            models.Index(fields=["vehicle", "-maintenance_date"]),
            models.Index(fields=["mechanic", "maintenance_date"]),
            models.Index(fields=["maintenance_date"]),
        ]

    def __str__(self):
        return f"{self.maintenance_type} - {self.vehicle} ({self.maintenance_date})"
