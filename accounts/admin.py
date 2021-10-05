from django.contrib import admin
from .models import Order


class OrderAdmin(admin.ModelAdmin):
    list_display = ("date", "user_id",)


admin.site.register(Order, OrderAdmin)
