from backend import serializers
from backend import models
from backend.api.internal.util.reqstatus import RequestStatus

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from rest_framework import status
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.exceptions import APIException

from datetime import datetime




class VMOSViewset(viewsets.ModelViewSet):
    queryset = models.VMOS.objects.all()
    serializer_class = serializers.VMOSSerializer


class RequestsViewset(viewsets.ModelViewSet):
    serializer_class = serializers.RequestsSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return models.Request.objects.all()
        else:
            return models.Request.objects.filter(user=user)

    @action(detail=False)
    def mine(self, request):
        user = self.request.user
        requests = models.Request.objects.filter(user=user)
        serializer = serializers.RequestsSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UsersViewset(viewsets.ModelViewSet):
    serializer_class = serializers.UsersSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return get_user_model().objects.all()
        else:
            return get_user_model().objects.filter(id=user.id)

class ListRequestsViewset(viewsets.ModelViewSet):
    serializer_class = serializers.ListRequestsSerializer
    def get_queryset(self):
        #import ipdb 
        #ipdb.set_trace()
        requests = models.Request.objects.filter(approved=-1).order_by('-request_date')
        
        return requests 

    @action(detail=False)
    def reject(self, request):
        requests = models.Request.objects.filter(approved=0).order_by('-approved_date')
        serializer = serializers.ListRequestsSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def approve(self, request):
        requests = models.Request.objects.filter(approved=1).order_by('-approved_date')
        serializer = serializers.ListRequestsSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
