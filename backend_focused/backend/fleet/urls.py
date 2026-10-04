from rest_framework.routers import DefaultRouter

from fleet import views

router = DefaultRouter()
router.register(r"offices", views.OfficeViewSet)
router.register(r"vehicles", views.VehicleViewSet)
router.register(r"mechanics", views.MechanicViewSet)
router.register(r"maintenance-records", views.MaintenanceRecordViewSet)

urlpatterns = router.urls
