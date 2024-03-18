"""api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path

from .api_endpoint_functions import auth_test, get_case_constants, get_cases_by_project_id, get_projects_by_user_id, \
    upload_constants, get_constants_by_user_id, get_heating_types, download_constants, \
    get_consumption_data, get_plant_types, edit_project_params, get_unit_options, get_unit_currencies, run_monte_carlo, \
    run_npv, run_mc_npv, run_fixed_costs, get_rating_data, get_default_discount_rates, get_nonenergy_data, \
    get_report_data, generate_report_excel, export_project, import_project, run_erv_first_case, run_erv_second_case, \
    RegisterView, get_users_by_user_permissions, constants_exist, run_erv_third_case, run_erv_fourth_case, \
    reset_report_data, reset_rating_data, calculate_bp_data, \
    add_bp_cases, get_bp_case_data, get_project_bp_year, get_bp_project_data, get_oc_values, \
    get_oc_default_values, search_investments, generate_bp_report, save_bp_data, edit_cases_erv_params, \
    delete_investment, delete_oc
from .views import ProjectList, ProjectDetail, CaseList, CaseDetail, ConstantsList, ConstantsDetail, \
    CustomTokenObtainPairView, CustomTokenRefreshView

urlpatterns = [
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register_user/', RegisterView.as_view(), name='register-user'),
    path('users_by_user_permissions/<int:user_id>', get_users_by_user_permissions, name='users-by-user-permissions'),
    path('projects/', ProjectList.as_view(), name='projects-list'),
    path('projects/<int:pk>', ProjectDetail.as_view(), name='projects-detail'),
    path('auth_test/', auth_test, name='auth-test'),
    path('cases/', CaseList.as_view(), name='cases-list'),
    path('cases/<int:pk>', CaseDetail.as_view(), name='cases-detail'),
    path('edit_cases_erv_params/', edit_cases_erv_params, name='edit-cases-erv-params'),
    path('constants/', ConstantsList.as_view(), name='constants-list'),
    path('constants/<int:pk>', ConstantsDetail.as_view(), name='constants-detail'),
    path('user_constants/<int:user_id>', get_constants_by_user_id, name='user-constants'),
    path('constants_exist/<int:project_id>', constants_exist, name='constants-exist'),
    path('case_info_constants/<int:user_id>', get_case_constants, name='case-constants'),
    path('project_cases/<int:project_id>', get_cases_by_project_id, name='project-cases'),
    path('user_projects/<int:user_id>', get_projects_by_user_id, name='user-projects'),
    path('upload_constants/', upload_constants, name='upload-constants'),
    path('download_constants/<int:user_id>', download_constants, name='download-constants'),
    path('heating_types/', get_heating_types, name='heating-types'),
    path('plant_types/', get_plant_types, name='plant-types'),
    path('project_params/<int:project_id>', edit_project_params, name='project-params'),
    path('unit_options/', get_unit_options, name='unit-options'),
    path('unit_currencies/', get_unit_currencies, name='unit-currencies'),

    path('consumption_data/', get_consumption_data, name='consumption-data'),
    path('monte_carlo/', run_monte_carlo, name='run-monte-carlo'),
    path('npv/', run_npv, name='run-npv'),
    path('mc_npv/', run_mc_npv, name='run-mc-npv'),
    path('fixed_costs/', run_fixed_costs, name='run-fixed-costs'),
    path('default_discount_rates/<int:user_id>', get_default_discount_rates, name='get-default-discount-rates'),
    path('rating_data/', get_rating_data, name='get-rating-data'),
    path('nonenergy_data/', get_nonenergy_data, name='get-nonenergy-data'),
    path('report_data/', get_report_data, name='get-report-data'),
    path('generate_report_excel/', generate_report_excel, name='generate-report-excel'),
    path('export_project/<int:project_id>', export_project, name='export-project'),
    path('import_project/', import_project, name='import-project'),
    path('erv_first_case/', run_erv_first_case, name='run-erv-first-case'),
    path('erv_second_case/', run_erv_second_case, name='run-erv-second-case'),
    path('erv_third_case/', run_erv_third_case, name='run-erv-third-case'),
    path('erv_fourth_case/', run_erv_fourth_case, name='run-erv-fourth-case'),
    path('reset_report_data/', reset_report_data, name='reset-report-data'),
    path('reset_rating_data/', reset_rating_data, name='reset-rating-data'),
    path('bp_outputs/', calculate_bp_data, name='bp-outputs'),
    path('add_bp_cases/', add_bp_cases, name='add-bp-case'),
    path('bp_case_data/', get_bp_case_data, name='bp_case_data'),
    path('project_bp_year/<int:project_id>', get_project_bp_year, name='project_bp_year'),
    path('bp_project_data/<int:project_id>', get_bp_project_data, name='bp_project_data'),
    path('oc_values/<int:project_id>', get_oc_values, name='oc_values'),
    path('oc_default_values/<int:project_id>', get_oc_default_values, name='get_oc_default_values'),
    path('search_investments/<str:name>', search_investments, name='search_investments'),
    path('generate_bp_report/', generate_bp_report, name='generate_bp_report_excel'),
    path('save_bp_data/', save_bp_data, name='save_bp_data_bp'),
    path('delete_investment/', delete_investment, name='delete_investment'),
    path('delete_oc/', delete_oc, name='delete_oc'),
]
