from django.contrib import admin
from .models import Product, Offer, Category


class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "stock", "price", "description", "img_url", "category")


class OfferAdmin(admin.ModelAdmin):
    list_display = ("code", "discount", "description", )


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


admin.site.register(Product, ProductAdmin)
admin.site.register(Offer, OfferAdmin)
admin.site.register(Category, CategoryAdmin)
