from django.db import models
from django.contrib.auth.models import User


class Order(models.Model):
    products = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField()

    def __str__(self):
        return "users order"
