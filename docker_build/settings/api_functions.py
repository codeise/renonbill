from distutils import util

from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.core import serializers as core_serializers
from rest_framework import status
from rest_framework.decorators import api_view

from avat.serializers_parser import ParserCSVFileSerialiser, TagsSerializer
from avat_dagster.source.import_parameters import get_batch_count, get_job_count, \
    get_bronze_rows_count, get_silver_rows_count
from avat_dagster.source.repo_dashboard import RepoDashboard as Repo
from avat_dagster.source.repo_import import RepoImport as RepoImport
from avat_dagster.source.repo_gold import RepoGold
from avat_dagster.source.statuses import Statuses
from avat_dagster.source.analytics_scripts.jupyter.repo_jupyter import RepoJupyter


def get_chunk_files(request):
    files = Repo.get_chunk_csv_files()
    serializer = ParserCSVFileSerialiser(files, many=True)
    return JsonResponse(serializer.data, safe=False)


def get_chunk_files_count(request):
    return JsonResponse(Repo.get_chunk_csv_files_count(), safe=False)


def get_chunk_files_by_parent_file_id(request, parent_file_id, results_per_page, page_number):
    files = Repo.get_csv_files_paginated_by_parent_file_id(parent_file_id, results_per_page, page_number)
    return JsonResponse({'items': files, 'totalItemsCount':
        Repo.get_chunk_csv_files_count_by_parent_file_id(parent_file_id)}, safe=False)


def get_parent_files(request, results_per_page, page_number):
    files = Repo.get_parent_csv_files_paginated(results_per_page, page_number)
    return JsonResponse({'items': files, 'totalItemsCount': Repo.get_parent_csv_files_count()}, safe=False)


def get_parent_files_count(request):
    return JsonResponse(Repo.get_parent_csv_files_count(), safe=False)


def get_parent_files_in_progress(request):
    files = RepoImport.get_in_progress_parent_csv_files()
    serializer = ParserCSVFileSerialiser(files, many=True)
    return JsonResponse(serializer.data, safe=False)


def get_parent_files_dashboard(request):
    files = Repo.get_parent_csv_files_dashboard()
    return JsonResponse(files, safe=False)


def get_jobs_by_parent_file_id(request, parent_file_id, results_per_page, page_number):
    jobs = Repo.get_jobs_paginated_by_parent_file_id(parent_file_id, results_per_page, page_number)
    return JsonResponse({'items': jobs, 'totalItemsCount': RepoImport.get_job_count_by_parent_file_id(parent_file_id)},
                        safe=False)


def get_job_statuses(request):
    job_statuses = Statuses.get_job_statuses()
    formatted_job_statuses = list()
    key = 1
    for job_status in job_statuses:
        formatted_job_statuses.append({'id': key, 'name': job_status})
        key += 1
    return JsonResponse(formatted_job_statuses, safe=False)


def get_batches_by_parent_file_id(request, parent_file_id, results_per_page, page_number):
    batches = Repo.get_batches_paginated_by_parent_file_id(parent_file_id, results_per_page, page_number)
    return JsonResponse({'items': batches, 'totalItemsCount': Repo.get_batch_count_by_parent_file_id(parent_file_id)},
                        safe=False)


def get_batch_statuses(request):
    batch_statuses = Statuses.get_batch_statuses()
    formatted_batch_statuses = list()
    key = 1
    for batch_status in batch_statuses:
        formatted_batch_statuses.append({'id': key, 'name': batch_status})
        key += 1
    return JsonResponse(formatted_batch_statuses, safe=False)


def get_file_statuses(request):
    file_statuses = Statuses.get_csv_file_statuses()
    formatted_file_statuses = list()
    key = 1
    for file_status in file_statuses:
        formatted_file_statuses.append({'id': key, 'name': file_status})
        key += 1
    return JsonResponse(formatted_file_statuses, safe=False)


def get_max_bronze_rows_count(request):
    max_bronze_rows_count = 0
    for parent_csvfile in RepoImport.get_in_progress_parent_csv_files():
        max_bronze_rows_count += get_bronze_rows_count(parent_csvfile)
    return JsonResponse(max_bronze_rows_count, safe=False)


def get_max_silver_rows_count(request):
    max_silver_rows_count = 0
    for parent_csvfile in RepoImport.get_in_progress_parent_csv_files():
        max_silver_rows_count += get_silver_rows_count(parent_csvfile)
    return JsonResponse(max_silver_rows_count, safe=False)


def get_max_batches_count(request):
    max_batches_count = 0
    for parent_csvfile in RepoImport.get_in_progress_parent_csv_files():
        max_batches_count += get_batch_count(parent_csvfile)
    return JsonResponse(max_batches_count, safe=False)


def get_max_jobs_count(request):
    max_jobs_count = 0
    for parent_csvfile in RepoImport.get_in_progress_parent_csv_files():
        max_jobs_count += get_job_count(parent_csvfile)
    return JsonResponse(max_jobs_count, safe=False)


def get_succeeded_parent_files_count(request):
    return JsonResponse(Repo.get_dashboard_parent_files_count(), safe=False)


def get_succeeded_bronze_rows_count(request):
    return JsonResponse(Repo.get_dashboard_bronze_rows_count(), safe=False)


def get_succeeded_silver_rows_count(request):
    return JsonResponse(Repo.get_dashboard_silver_rows_count(), safe=False)


def get_succeeded_bronze_rows_count_by_file(request, parent_file_id):
    return JsonResponse(Repo.get_bronze_rows_count_by_parent_file_id(parent_file_id), safe=False)


def get_succeeded_silver_rows_count_by_file(request, parent_file_id):
    return JsonResponse(Repo.get_silver_rows_count_by_parent_file_id(parent_file_id), safe=False)


def get_succeeded_bronze_jobs_count(request):
    return JsonResponse(Repo.get_dashboard_bronze_done_jobs_count(), safe=False)


def get_succeeded_bronze_jobs_count_by_file(request, parent_file_id):
    return JsonResponse(Repo.get_succeeded_bronze_jobs_count_by_file(parent_file_id), safe=False)


def get_succeeded_jobs_count(request):
    return JsonResponse(Repo.get_dashboard_jobs_count(), safe=False)


def get_succeeded_batches_count(request):
    return JsonResponse(Repo.get_dashboard_batches_count(), safe=False)


def get_succeeded_jobs_count_by_file(request, parent_file_id):
    return JsonResponse(Repo.get_succeeded_jobs_count_by_file(parent_file_id), safe=False)


def get_succeeded_batches_count_by_file(request, parent_file_id):
    return JsonResponse(Repo.get_succeeded_batches_count_by_file(parent_file_id), safe=False)


def get_max_bronze_rows_count_by_file(request, parent_file_id):
    file = RepoImport.get_csv_file(parent_file_id)
    return JsonResponse(get_bronze_rows_count(file), safe=False)


def get_max_silver_rows_count_by_file(request, parent_file_id):
    file = RepoImport.get_csv_file(parent_file_id)
    return JsonResponse(get_silver_rows_count(file), safe=False)


def get_max_jobs_count_by_file(request, parent_file_id):
    file = RepoImport.get_csv_file(parent_file_id)
    return JsonResponse(get_job_count(file), safe=False)


def get_max_batches_count_by_file(request, parent_file_id):
    file = RepoImport.get_csv_file(parent_file_id)
    return JsonResponse(get_batch_count(file), safe=False)


def hello_world_test(request):
    return JsonResponse("Hello World Test!", safe=False)


def silver_ordered_by_column_by_parent_id(request, parent_file_id, results_per_page, page_number, column, desc):
    try:
        desc = bool(util.strtobool(desc))
        result_data = Repo.get_silver_paginated_ordered_by_column_by_parent_file_id \
            (parent_file_id, results_per_page, page_number, column, desc)
    except ValueError:
        result_data = []
        pass
    return JsonResponse({'items': result_data, 'totalItemsCount': Repo.get_silver_rows_count_by_parent_file_id
    (parent_file_id)}, safe=False)


def get_file_times(request, avat_file_id):
    return JsonResponse(Repo.get_file_times(avat_file_id))


def add_gold_execution(request, avat_file_id, name):
    succeeded = True
    if not RepoGold.add_gold_execution_by_avatfile_id(avat_file_id, name):
        succeeded = False
    return JsonResponse({"succeeded": succeeded})


def gold_executions_finished(request, avat_file_id):
    gold_executions = RepoGold.get_gold_executions_not_done_by_avatfile_id(avat_file_id)
    if gold_executions is None:
        return JsonResponse(None)
    finished = (len(gold_executions) <= 0)
    return JsonResponse({"finished": finished})


def get_tags(request):
    serializer = TagsSerializer(RepoJupyter.get_tags(), many=True)
    return JsonResponse(serializer.data, safe=False)


def assign_tag_by_id(request, tag_id, avat_file_id, from_epoch, to_epoch):
    RepoJupyter.assign_tag_bulk_qs(RepoJupyter.get_tag(tag_id).name,
                                   RepoImport.get_silver_rows(avat_file_id, from_epoch, to_epoch))
    return HttpResponse(status=200)


def assign_tag_by_name(request, tag_name, avat_file_id, from_epoch, to_epoch):
    RepoJupyter.assign_tag_bulk_qs(tag_name, RepoImport.get_silver_rows(avat_file_id, from_epoch, to_epoch))
    return HttpResponse(status=200)


@api_view(['POST'])
def avat_basic_auth(request):
    password = request.data['password']
    correct = password == "Avat303@"
    return HttpResponse(1 if correct else 0, status=status.HTTP_200_OK)
