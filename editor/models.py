from django.db import models


class Config(models.Model):
    product = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    target_observable_type = models.CharField(max_length=255)
    strong = models.JSONField()
    weak = models.JSONField()
    extra_prop = models.JSONField()
    related_extra_prop = models.JSONField()
    target_extra_prop = models.JSONField()
    target_related_extra_prop = models.JSONField()
