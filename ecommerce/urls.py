from django.contrib import admin
from django.urls import path, include
from frontend import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include("api.urls")),
    path('', views.index)
]
