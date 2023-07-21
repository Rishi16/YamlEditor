from django.urls import path
from . import views

urlpatterns = [
    path("", views.upload_file, name="upload_file"),
    path("table/", views.table_display, name="table_display"),
    path('update_column/', views.update_column, name='update_column'),
]
