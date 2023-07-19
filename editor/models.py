# models.py
from django.db import models


class Config(models.Model):
    id = models.AutoField(primary_key=True)  # Add the id field as the primary key
    product = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    target_observable_type = models.CharField(max_length=100)
    strong = models.CharField(max_length=100)
    weak = models.CharField(max_length=100)
    related_extra_prop = models.TextField()
    extra_prop = models.TextField()
    target_related_extra_prop = models.TextField()
    target_extra_prop = models.TextField()

    def __str__(self):
        return self.name