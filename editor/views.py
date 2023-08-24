import json

from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Config
import yaml
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict


@csrf_exempt
def update_column(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        record_id = body.get('id')
        field = body.get('field')
        new_value = body.get('newValue')

        try:
            # Retrieve the record from the database
            print(record_id, field, new_value)
            record = Config.objects.get(id=record_id)

            # Update the field with the new value
            setattr(record, field, new_value)
            record.save()
            print(Config.objects.get(id=record_id).__dict__)
            # Return a success response
            return JsonResponse({'status': 'success'})
        except Config.DoesNotExist:
            # Return an error response if the record is not found
            return JsonResponse({'status': 'error', 'message': 'Record not found'})
        except Exception as e:
            # Return an error response for any other exceptions
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        # Return an error response if the request method is not POST
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


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

@csrf_exempt
def save_new_record(request):
    if request.method == 'POST':
        # Get the data from the POST request
        body = json.loads(request.body)
        product = body.get('product')
        type = body.get('type')
        name = body.get('name')
        target_observable_type = body.get('target_observable_type')
        strong = body.get('strong')
        weak = body.get('weak')
        target_extra_prop = body.get('target_extra_prop')
        extra_prop = body.get('extra_prop')
        target_related_extra_prop = body.get('target_related_extra_prop')
        related_extra_prop = body.get('related_extra_prop')

        # Create a new instance of your model
        new_record = Config(
            product=product,
            type=type,
            name=name,
            target_observable_type=target_observable_type,
            strong=strong,
            weak=weak,
            target_extra_prop=target_extra_prop,
            extra_prop=extra_prop,
            target_related_extra_prop=target_related_extra_prop,
            related_extra_prop=related_extra_prop
        )

        # Save the new record
        new_record.save()

        return JsonResponse({'success': True, 'record': model_to_dict(new_record)})  # Return a success response

    return JsonResponse({'success': False})  # Return an error response

@csrf_exempt
def delete_record(request):
    if request.method == 'POST':
        record_id = json.loads(request.body).get('record_id')
        print("Delete ", record_id)
        try:
            config = Config.objects.get(pk=record_id)
            config.delete()
            return JsonResponse({'success': True})
        except Config.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Record not found'})

