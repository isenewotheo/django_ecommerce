from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.index),
    path("products/", include("products.urls")),
    path("accounts/", include("accounts.urls"))
]

# urlpatterns += router.urls
