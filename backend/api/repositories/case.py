from api.models import Case


def get_by_project_id(project_id):
    return Case.objects.order_by('id').all().filter(project_id=project_id)


def get_by_ids(ids):
    return Case.objects.filter(pk__in=ids)


def get_by_id(id):
    return Case.objects.filter(pk=id).get()
