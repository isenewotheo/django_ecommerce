from django.db import models


class Category(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.FloatField()
    stock = models.IntegerField()
    img_url = models.FileField(upload_to='static/images/', null=True, verbose_name="")
    description = models.TextField(max_length=3000)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Offer(models.Model):
    code = models.CharField(max_length=10)
    description = models.TextField(max_length=300)
    discount = models.FloatField()
    product = models.ForeignKey(Product, null=True, on_delete=models.CASCADE)

    def __str__(self):
        return self.code
