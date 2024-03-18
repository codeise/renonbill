from api.models import Project


def get_by_user_id(user_id):
    return Project.objects.order_by('id').all().filter(user_id=user_id)


def get_by_id(id):
    return Project.objects.get(pk=id)
