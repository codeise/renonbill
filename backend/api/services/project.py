from api.repositories import project as project_repository


def get_by_user_id(user_id):
    return project_repository.get_by_user_id(user_id)


def get_by_id(id):
    return project_repository.get_by_id(id)


def edit_params(id, params):
    project = project_repository.get_by_id(id)
    project.params = params
    project.save()
    return True


def save_rating_data(id, data):
    project = project_repository.get_by_id(id)
    current_data = project.rating_data
    for k, v in data.items():
        current_data[k] = v
    project.save()


def save_report_data(id, data):
    project = project_repository.get_by_id(id)
    current_data = project.report_data
    for k, v in data.items():
        current_data[k] = v
    project.save()


def get_bp_year(id):
    project = project_repository.get_by_id(id)
    params = project.params
    for k,v in params.items():
        if(k == "bp_year"):
            return v
