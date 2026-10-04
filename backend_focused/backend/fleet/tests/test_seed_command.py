import pytest
from django.core.management import call_command

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle

pytestmark = pytest.mark.django_db


class TestSeedCommand:
    def test_seed_creates_data(self):
        call_command("seed", "--clear")

        assert Office.objects.count() == 5
        assert Vehicle.objects.count() == 30
        assert Mechanic.objects.count() == 10
        assert MaintenanceRecord.objects.count() > 0

    def test_seed_clear_removes_existing(self):
        call_command("seed")
        call_command("seed", "--clear")

        assert Office.objects.count() == 5
        assert Vehicle.objects.count() == 30

    def test_seed_idempotent_offices(self):
        call_command("seed")
        call_command("seed")

        assert Office.objects.count() == 5
