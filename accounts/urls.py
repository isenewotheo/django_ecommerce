from django.urls import path
from . import views

urlpatterns = [
    path("", views.index),
    path("me/", views.me),
    path("me/orders/", views.orders),
    path("login/", views.login_view),
    path("logout/", views.logout_view),
    path("signup/", views.signup)
]
