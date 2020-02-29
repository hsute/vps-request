from backend import serializers
from backend import models

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import IntegrityError

from rest_framework import status
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import APIException

from datetime import datetime


class NotFound(APIException):
    def __init__(self, status, detail, code=None):
        self.status_code = status
        self.detail = detail
        self.code = code if code else detail


class ListRequests(APIView):
    def post(self, request):
        user = get_user_model().objects.get(username=request.data['username'])
        request.data['user'] = user.pk
        request.data['request_date'] = datetime.now()
        request.data['approved'] = -1

        serializer = serializers.RequestsSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        reqdb = models.Request.objects.get(id=pk)
        request.data['user'] = reqdb.user.pk
        reqdb.timestamp = datetime.now()
        request.data['request_date'] = reqdb.request_date
        request.data['approved'] = reqdb.approved

        serializer = serializers.RequestsSerializer(reqdb, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _get_by_username(self, username):
        user = get_user_model().objects.get(username=username)
        requests = models.Request.objects.filter(user=user)
        return requests

    def get(self, request):
        requests = models.Request.objects.all()
        serializer = serializers.RequestsSerializer(requests, many=True)

        return Response(serializer.data)


class ListRequestsId(APIView):
    def get(self, request, pk=None):
        try:
            requests = self._get_by_username(request.user.username)
            requests = requests.get(id=pk)
            serializer = serializers.RequestsSerializer(requests)

            return Response(serializer.data)

        except models.Request.DoesNotExist:
            raise NotFound(status=404, detail='Request not found')


class ListRequestsUsername(ListRequests):
    def get(self, request, username=None):
        requests = self._get_by_username(username)
        serializer = serializers.RequestsSerializer(requests, many=True)

        return Response(serializer.data)


class ListUsers(APIView):
    def get(self, request, username=None):
        if username:
            try:
                user = get_user_model().objects.get(username=username)
                serializer = serializers.UsersSerializer(user)
                return Response(serializer.data)

            except get_user_model().DoesNotExist:
                raise NotFound(status=404,
                               detail='User not found')

        else:
            users = get_user_model().objects.all()
            serializer = serializers.UsersSerializer(users, many=True)

            data = sorted(serializer.data, key=lambda k: k['username'].lower())

            return Response(data)

    def put(self, request):
        try:
            user = get_user_model().objects.get(pk=request.data['pk'])
            user.username = request.data['username']
            user.first_name = request.data['first_name']
            user.last_name = request.data['last_name']
            user.email = request.data['email']
            user.is_superuser = request.data['is_superuser']
            user.is_staff = request.data['is_staff']
            user.is_active = request.data['is_active']
            user.save()

            return Response(status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {'detail': 'User with this username already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        try:
            get_user_model().objects.create_user(
                username=request.data['username'],
                password=request.data['password'],
                email=request.data['email'],
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
                is_superuser=request.data['is_superuser'],
                is_staff=request.data['is_staff'],
                is_active=request.data['is_active']
            )

            return Response(status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {'detail': 'User with this username already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, username=None):
        if username:
            try:
                user = get_user_model().objects.get(username=username)
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

            except get_user_model().DoesNotExist:
                raise(NotFound(status=404, detail='User not found'))

        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class GetConfigOptions(APIView):
    authentication_classes = ()
    permission_classes = ()

    def get(self, request):
        options = dict()

        if settings.ALWAYS_LOGGEDIN:
            options.update(AlwaysLoggedIn=settings.ALWAYS_LOGGEDIN)
            options.update(SuperUser=settings.SUPERUSER_NAME)

        return Response({'result': options})


class IsSessionActive(APIView):
    def get(self, request):
        user = dict()

        for key in ['username', 'first_name', 'last_name', 'email', 'is_staff',
                    'is_active', 'aaieduhr', 'institution', 'role']:
            user[key] = eval('request.user.{}'.format(key))

        return Response({'active': True, 'userdetails': user})


class Saml2Login(APIView):
    keys = ['username', 'first_name', 'last_name', 'is_superuser']

    def _prefix(self, keys):
        return ['saml2_' + key for key in keys]

    def _remove_prefix(self, keys):
        new_keys = dict()

        for k, v in keys.items():
            new_keys[k.split('saml2_')[1]] = v

        return new_keys

    def get(self, request):
        result = cache.get_many(self._prefix(self.keys))

        return Response(self._remove_prefix(result))

    def delete(self, request):
        cache.delete_many(self._prefix(self.keys))

        return Response(status=status.HTTP_204_NO_CONTENT)


class VMOS(APIView):
    def get(self, request):
        oses = models.VMOS.objects.all()
        serializer = serializers.VMOSSerializer(oses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class RequestsViewset(viewsets.ModelViewSet):
    queryset = models.Request.objects.all()
    serializer_class = serializers.RequestsSerializer


class UsersViewset(viewsets.ModelViewSet):
    queryset = models.User.objects.all()
    serializer_class = serializers.UsersSerializer
