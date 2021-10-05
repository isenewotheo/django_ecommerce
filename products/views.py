from rest_framework.viewsets import GenericViewSet
from rest_framework.viewsets import mixins
from .serializers import ProductSerializer
from .models import Product
from django.http import JsonResponse, HttpResponseServerError


class ProductGenericViewApi(GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()


def search_product(request):
    search_value = request.GET.get("q")
    print(search_value)
    data = []
    try:
        s_query = Product.objects.filter(name__contains=search_value)
        for product in s_query:
            data.append(ProductSerializer(product).data)
        return JsonResponse(data, safe=False)
    except Exception as err:
        print("error")
        print(err)
        return HttpResponseServerError("there was an error")


def category(request, prod_id):
    id_list = [1, 2, 3]
    if prod_id in id_list:
        data = []
        try:
            s_query = Product.objects.filter(category__id=prod_id)
            for product in s_query:
                serializer = ProductSerializer(product)
                data.append(serializer.data)
        except (TypeError,):
            print("it does not exist")

        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "there are only children:<3>, men:<2> and women:<1> category"})
