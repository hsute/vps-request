from django.urls import path

from . import views

app_name = 'backend'

urlpatterns = [
    path('users/', views.ListUsers.as_view(), name='users'),
    path('users/<str:username>', views.ListUsers.as_view(), name='users'),
]
