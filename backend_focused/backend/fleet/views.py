from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle
from fleet.serializers import (
    AssignVehicleSerializer,
    DuplicateCheckSerializer,
    MaintenanceRecordSerializer,
    MechanicSerializer,
    MechanicWorkloadSerializer,
    OfficeSerializer,
    OfficeSummarySerializer,
    VehicleDetailSerializer,
    VehicleNeedsMaintenanceSerializer,
    VehicleSerializer,
)
from fleet.services import (
    check_duplicate_vehicle,
    get_mechanic_workload,
    get_office_summary,
    get_vehicle_detail,
    get_vehicles_needing_maintenance,
    search_vehicles,
)


class ProtectedDeleteMixin:
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete this object because it is referenced by other records."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class OfficeViewSet(ProtectedDeleteMixin, ModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer

    @action(detail=False, methods=["get"])
    def summary(self, request):
        qs = get_office_summary()
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = OfficeSummarySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OfficeSummarySerializer(qs, many=True)
        return Response(serializer.data)


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.select_related("office")
    serializer_class = VehicleSerializer

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VehicleDetailSerializer
        return VehicleSerializer

    def retrieve(self, request, *args, **kwargs):
        get_object_or_404(Vehicle, pk=kwargs["pk"])
        vehicle = get_vehicle_detail(kwargs["pk"])
        serializer = VehicleDetailSerializer(vehicle)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def search(self, request):
        params = request.query_params
        qs = search_vehicles(
            office=params.get("office"),
            is_active=_parse_bool(params.get("is_active")),
            make=params.get("make"),
            model=params.get("model"),
            maintenance_from=params.get("maintenance_from"),
            maintenance_to=params.get("maintenance_to"),
            mechanic_cert=params.get("mechanic_cert"),
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = VehicleSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = VehicleSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="maintenance-history")
    def maintenance_history(self, request, pk=None):
        records = (
            MaintenanceRecord.objects.filter(vehicle_id=pk)
            .select_related("mechanic")
            .order_by("-maintenance_date")
        )
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = MaintenanceRecordSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MaintenanceRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        vehicle = self.get_object()
        serializer = AssignVehicleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vehicle.office_id = serializer.validated_data["office_id"]
        vehicle.save(update_fields=["office_id"])
        return Response(VehicleSerializer(vehicle).data)

    @action(detail=False, methods=["get"], url_path="needing-maintenance")
    def needing_maintenance(self, request):
        qs = get_vehicles_needing_maintenance()
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = VehicleNeedsMaintenanceSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = VehicleNeedsMaintenanceSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="duplicate-check")
    def duplicate_check(self, request):
        serializer = DuplicateCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conflicts = check_duplicate_vehicle(
            vin=serializer.validated_data.get("vin"),
            license_plate=serializer.validated_data.get("license_plate"),
        )
        return Response({"conflicts": conflicts})


class MechanicViewSet(ProtectedDeleteMixin, ModelViewSet):
    queryset = Mechanic.objects.all()
    serializer_class = MechanicSerializer

    @action(detail=False, methods=["get"])
    def workload(self, request):
        qs = get_mechanic_workload()
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = MechanicWorkloadSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MechanicWorkloadSerializer(qs, many=True)
        return Response(serializer.data)


class MaintenanceRecordViewSet(ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related("vehicle", "mechanic")
    serializer_class = MaintenanceRecordSerializer


def _parse_bool(value):
    if value is None:
        return None
    return value.lower() in ("true", "1", "yes")
