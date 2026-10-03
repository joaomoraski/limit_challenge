from datetime import date

from rest_framework import serializers

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ["id", "name", "city"]


class VehicleSerializer(serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id", "vin", "license_plate", "make", "model",
            "year", "office", "office_name", "is_active",
        ]

    def validate_year(self, value):
        if value < 1900:
            raise serializers.ValidationError("Year must be 1900 or later.")
        if value > date.today().year + 2:
            raise serializers.ValidationError("Year cannot be more than 2 years in the future.")
        return value


class MechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = ["id", "name", "certification_number", "is_active"]


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    mechanic_name = serializers.CharField(source="mechanic.name", read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            "id", "vehicle", "mechanic", "mechanic_name",
            "maintenance_date", "maintenance_type", "cost", "notes",
        ]

    def validate_maintenance_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Maintenance date cannot be in the future.")
        return value

    def validate_cost(self, value):
        if value > 999999:
            raise serializers.ValidationError("Cost cannot exceed $999,999.00.")
        return value


class MaintenanceRecordDetailSerializer(serializers.ModelSerializer):
    mechanic = MechanicSerializer(read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            "id", "vehicle", "mechanic",
            "maintenance_date", "maintenance_type", "cost", "notes",
        ]


class VehicleDetailSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)
    maintenance_records = MaintenanceRecordDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id", "vin", "license_plate", "make", "model",
            "year", "office", "is_active", "maintenance_records",
        ]


class OfficeSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    city = serializers.CharField()
    active_vehicle_count = serializers.IntegerField()
    maintenance_cost_last_year = serializers.DecimalField(max_digits=12, decimal_places=2)
    last_maintenance = serializers.DateField(allow_null=True)


class MechanicWorkloadSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    certification_number = serializers.CharField()
    records_this_year = serializers.IntegerField()
    total_cost_this_year = serializers.DecimalField(max_digits=12, decimal_places=2)


class VehicleNeedsMaintenanceSerializer(serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True)
    last_maintenance_date = serializers.DateField(allow_null=True)

    class Meta:
        model = Vehicle
        fields = [
            "id", "vin", "license_plate", "make", "model",
            "year", "office", "office_name", "last_maintenance_date",
        ]


class AssignVehicleSerializer(serializers.Serializer):
    office_id = serializers.IntegerField()

    def validate_office_id(self, value):
        if not Office.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Office not found.")
        return value


class DuplicateCheckSerializer(serializers.Serializer):
    vin = serializers.CharField(required=False, allow_blank=True)
    license_plate = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get("vin") and not attrs.get("license_plate"):
            raise serializers.ValidationError("Provide at least one of 'vin' or 'license_plate'.")
        return attrs
