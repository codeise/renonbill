from api.repositories import case as case_repository


def get_by_project_id(project_id):
    return case_repository.get_by_project_id(project_id)


def get_by_ids(ids):
    return case_repository.get_by_ids(ids)

