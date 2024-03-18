import math


def calculate_area(x, y):
    return x * y


def calc_volume(x):
    if x <= 0:
        raise Exception("x must be bigger than 0")
    return pow(x, 3)


def is_float(value):
    try:
        float(value)
        return True
    except ValueError:
        return False


def validate_value(val):
    if not is_float(val):
        raise ValueIsNotNumericError
    elif val < 0:
        raise NumberIsNotPositiveError
    else:
        return val


def validate_suraface_to_volume(building_type, wall_height, floor_count, floor_area, s_v):
    if building_type == "multistorey" or building_type == "detached house":
        s_v_min = 2 * (0.5 / (wall_height * floor_count) + 1.7724 / math.sqrt(floor_area))
        if s_v < s_v_min:
            raise SurfaceToVolumeIsLessThanMin(
                "Entered S/V value is less than min S/V value " + "{:.2f}".format(s_v_min))
    return s_v


class NumberIsNotPositiveError(Exception):
    pass


class ValueIsNotNumericError(Exception):
    pass


class SurfaceToVolumeIsLessThanMin(Exception):
    pass
