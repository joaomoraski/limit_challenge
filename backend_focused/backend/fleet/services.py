from datetime import timedelta
from decimal import Decimal

from django.db.models import (
    Count,
    DecimalField,
    F,
    Max,
    Prefetch,
    Q,
    Sum,
)
from django.db.models.functions import Coalesce
from django.utils.timezone import now

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle


def get_office_summary():
    twelve_months_ago = now().date() - timedelta(days=365)
    return Office.objects.annotate(
        active_vehicle_count=Count(
            "vehicles",
            filter=Q(vehicles__is_active=True),
            distinct=True,
        ),
        maintenance_cost_last_year=Coalesce(
            Sum(
                "vehicles__maintenance_records__cost",
                filter=Q(vehicles__maintenance_records__maintenance_date__gte=twelve_months_ago),
            ),
            Decimal("0.00"),
            output_field=DecimalField(),
        ),
        last_maintenance=Max("vehicles__maintenance_records__maintenance_date"),
    ).order_by("name")


def search_vehicles(
    *,
    office=None,
    is_active=None,
    make=None,
    model=None,
    maintenance_from=None,
    maintenance_to=None,
    mechanic_cert=None,
):
    qs = Vehicle.objects.select_related("office")
    filters = Q()

    if office is not None:
        filters &= Q(office_id=office)
    if is_active is not None:
        filters &= Q(is_active=is_active)
    if make:
        filters &= Q(make__icontains=make)
    if model:
        filters &= Q(model__icontains=model)
    if maintenance_from:
        filters &= Q(maintenance_records__maintenance_date__gte=maintenance_from)
    if maintenance_to:
        filters &= Q(maintenance_records__maintenance_date__lte=maintenance_to)
    if mechanic_cert:
        filters &= Q(maintenance_records__mechanic__certification_number=mechanic_cert)

    return qs.filter(filters).distinct()


def get_vehicle_detail(pk):
    return (
        Vehicle.objects.select_related("office")
        .prefetch_related(
            Prefetch(
                "maintenance_records",
                queryset=MaintenanceRecord.objects.select_related("mechanic").order_by(
                    "-maintenance_date"
                ),
            )
        )
        .get(pk=pk)
    )


def get_mechanic_workload():
    current_year = now().year
    year_filter = Q(maintenance_records__maintenance_date__year=current_year)

    return Mechanic.objects.annotate(
        records_this_year=Count("maintenance_records", filter=year_filter),
        total_cost_this_year=Coalesce(
            Sum("maintenance_records__cost", filter=year_filter),
            Decimal("0.00"),
            output_field=DecimalField(),
        ),
    ).order_by("-records_this_year")


def get_vehicles_needing_maintenance():
    threshold = now().date() - timedelta(days=365)
    return (
        Vehicle.objects.filter(is_active=True)
        .annotate(last_maintenance_date=Max("maintenance_records__maintenance_date"))
        .filter(Q(last_maintenance_date__isnull=True) | Q(last_maintenance_date__lt=threshold))
        .select_related("office")
        .order_by(F("last_maintenance_date").asc(nulls_first=True))
    )


def check_duplicate_vehicle(vin=None, license_plate=None, exclude_id=None):
    conflicts = []
    base_qs = Vehicle.objects.all()
    if exclude_id:
        base_qs = base_qs.exclude(pk=exclude_id)

    if vin and base_qs.filter(vin__iexact=vin).exists():
        conflicts.append("vin")
    if license_plate and base_qs.filter(license_plate__iexact=license_plate, is_active=True).exists():
        conflicts.append("license_plate")

    return conflicts
