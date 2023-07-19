from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Config
import yaml


def upload_file(request):
    if request.method == "POST" and request.FILES["file"]:
        file = request.FILES["file"]
        try:
            config_data = yaml.safe_load(file)
            validate_config(config_data)
            save_config(config_data)
            return redirect("table_display")
        except Exception as e:
            error_message = str(e)
            return render(request, "upload.html", {"error_message": error_message})
    return render(request, "upload.html")


def validate_config(config_data):
    if "config" not in config_data:
        raise ValueError('Invalid YAML structure: "config" key not found')

    for item in config_data["config"]:
        if "product" not in item or "type" not in item or "name" not in item:
            raise ValueError(
                f"Mandatory fields (product, type, name) missing for a config item: {item}"
            )

        if (
            not isinstance(item["product"], str)
            or not isinstance(item["type"], str)
            or not isinstance(item["name"], str)
        ):
            raise ValueError(f"Product, type, and name must be of string type: {item}")

        if (
            "strong" not in item
            or "weak" not in item
            or "extra_prop" not in item
            or "related_extra_prop" not in item
        ):
            raise ValueError(
                "Mandatory list fields (strong, weak, extra_prop, related_extra_prop) missing "
                f"for a config item: : {item}"
            )

        if (
            not isinstance(item["strong"], list)
            or not isinstance(item["weak"], list)
            or not isinstance(item["extra_prop"], list)
            or not isinstance(item["related_extra_prop"], list)
        ):
            raise ValueError(
                f"Strong, weak, extra_prop, and related_extra_prop must be lists: {item}"
            )

        if item.get("target_observable_type") and not isinstance(item["target_observable_type"], str):
            raise ValueError(f"target_observable_type must be of string type: {item}")

        if item.get("target_extra_prop") and len(item["extra_prop"]) != len(item["target_extra_prop"]):
            raise ValueError(
                f"Mismatch in length of extra_prop and target_extra_prop lists: {item}"
            )

        if item.get("target_related_extra_prop") and len(item["related_extra_prop"]) != len(item["target_related_extra_prop"]):
            raise ValueError(
                f"Mismatch in length of related_extra_prop and target_related_extra_prop lists: {item}"
            )


def save_config(config_data):
    for item in config_data["config"]:
        config = Config(
            product=item["product"],
            type=item["type"],
            name=item["name"],
            target_observable_type=item.get("target_observable_type", ""),
            strong=item["strong"],
            weak=item["weak"],
            extra_prop=item["extra_prop"],
            related_extra_prop=item["related_extra_prop"],
            target_extra_prop=item.get("target_extra_prop", []),
            target_related_extra_prop=item.get("target_related_extra_prop", []),
        )
        config.save()


def table_display(request):
    configs = Config.objects.all()
    return render(request, "table_display.html", {"configs": configs})
