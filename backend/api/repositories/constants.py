from api.models import Constants


def get_by_user_id(user_id):
    return Constants.objects.get(user_id=user_id)


def create(user_id, cc, td, ew, hdhw, otd, vc, du, uv):
    return Constants.objects.create(user_id=user_id, city_climate=cc, thermal_data=td, envelope_windows=ew,
                                    heating_dhw=hdhw, other_thermal_data=otd, variable_costs=vc,
                                    default_uncertainty=du, uncertain_variables=uv)


def edit_params(pk, cc, td, ew, hdhw, otd, vc, du, uv):
    try:
        constants = Constants.objects.get(pk=pk)
    except Constants.DoesNotExist:
        return None
    constants.city_climate = cc
    constants.thermal_data = td
    constants.envelope_windows = ew
    constants.heating_dhw = hdhw
    constants.other_thermal_data = otd
    constants.variable_costs = vc
    constants.default_uncertainty = du
    constants.uncertain_variables = uv
    constants.save()
    return constants
