#  this is not needed now
#
from django.urls import path, include, re_path
from .views import ProductGenericViewApi, category, search_product
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("", ProductGenericViewApi, basename="products")

urlpatterns = [
    path("categories/<int:prod_id>/", category),
    re_path(r"^search/$", search_product),
    path("", include(router.urls)),
]
