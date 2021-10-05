# from django.shortcuts import render
from django.http import JsonResponse


def index(request):
    resp = {
        "api_description": {
            "api/products": "to get products",
            "api/auth": "to login/logout"
        }
    }
    return JsonResponse(resp)

