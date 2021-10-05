from django.http import JsonResponse, HttpResponseForbidden, HttpResponseBadRequest, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Order
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .serializers import UserSerializer, OrderSerializer
from .forms import NewUserForm


def index(request):
    return JsonResponse({"accounts": "page"})


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        print(request.body)
        try:
            # this is to verify that the incoming json is not empty
            # if it is empty return an HttpResponseBadRequest
            data = json.loads(request.body)
            username = data["username"]
            password = data["password"]
            # print(username, password)
        except (json.JSONDecodeError, ValueError):
            print("there was an errr")
            return HttpResponseBadRequest(json.dumps({"error": "Wrong details"}), content_type="application/json")

        user_ = authenticate(username=username, password=password)
        if user_ is not None:
            print("form is valid")
            login(request, user_)
            return JsonResponse({"details": "login you in"})
        else:
            print("form is not valid")
            print(user_)
            return HttpResponseBadRequest(json.dumps({"error": "Wrong details"}), content_type="application/json")
    else:
        return HttpResponseForbidden(json.dumps({"error": "only Post allowed"}), content_type="application/json")


@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "logout successful"})


@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            # this is to verify that the incoming json is not empty
            # if it is empty return an HttpResponseBadRequest
            print(json.loads(request.body))
        except:
            print(json.loads(request.body)) 
            return HttpResponseBadRequest(json.dumps({"error": "Wrong details"}), content_type="application/json")

        form = NewUserForm(json.loads(request.body))
        if form.is_valid():
            print("data is valid")
            try:
                form.save()
                return JsonResponse({"message": "User Created Successfully"})
            except:
                return HttpResponseBadRequest(json.dumps({"error": "there was an internal server error"}),
                                              content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps(form.errors), content_type="application/json")
    else:
        return HttpResponseForbidden(json.dumps({"error": "only Post allowed"}), content_type="application/json")


@csrf_exempt
# @login_required()
def me(request):
    user_ = UserSerializer(request.user).data
    return JsonResponse(user_)


@login_required()
def orders(request):
    try:
        orders_ = Order.objects.filter(user=request.user)
        data = []
        for order in orders_:
            data.append(OrderSerializer(order).data)
        print(data)
        return JsonResponse(data, safe=False)
    except:
        print("err")
        return HttpResponseServerError()
