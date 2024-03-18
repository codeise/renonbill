from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.fields import JSONField
from rest_framework.relations import PrimaryKeyRelatedField
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Project, Case, Constants, BpInvestment, BpProject, BpCase, OcProject


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super(CustomTokenObtainPairSerializer, self).validate(attrs)
        data.update({'user_id': self.user.id})
        return data


class ConstantsSerializer(serializers.ModelSerializer):
    file = serializers.FileField(read_only=True)
    file_name = serializers.CharField()
    user_id = PrimaryKeyRelatedField(source='user', queryset=User.objects.all())
    city_climate = JSONField()
    thermal_data = JSONField()
    envelope_windows = JSONField()
    heating_dhw = JSONField()
    other_thermal_data = JSONField()
    variable_costs = JSONField()
    default_uncertainty = JSONField()
    uncertain_variables = JSONField()

    class Meta:
        model = Constants
        fields = ['id', 'file', 'file_name', 'user_id', 'city_climate', 'thermal_data', 'envelope_windows',
                  'heating_dhw', 'other_thermal_data', 'variable_costs', 'default_uncertainty', 'uncertain_variables']


class BpCasesSerializer(serializers.ModelSerializer):
    case_id = PrimaryKeyRelatedField(source='case', queryset=Case.objects.all())

    class Meta:
        model = BpCase
        fields = ['id', 'year', 'renovation_count', 'government_subsidy', 'case_id']


class CaseSerializer(serializers.ModelSerializer):
    project_id = PrimaryKeyRelatedField(source='project', queryset=Project.objects.all())
    common_params = JSONField()
    current_params = JSONField()
    planned_params = JSONField()
    fixed_costs = serializers.SerializerMethodField('get_fixed_costs')
    bp_cases = BpCasesSerializer(many=True, read_only=True)

    def get_fixed_costs(self, obj):
        if "fixed_costs" in self.context:
            return self.context["fixed_costs"][obj.id]
        else:
            return {}

    class Meta:
        model = Case
        fields = ['id', 'project_id', 'common_params', 'current_params', 'planned_params', 'fixed_costs', 'bp_cases']


class BpInvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BpInvestment
        fields = ['id', 'name']


class OcProjectSerializer(serializers.ModelSerializer):
    project_id = PrimaryKeyRelatedField(source='project', queryset=Project.objects.all())
    investment = BpInvestmentSerializer(many=False, read_only=True)
    investment_id = PrimaryKeyRelatedField(source='investment', queryset=BpInvestment.objects.all())

    class Meta:
        model = OcProject
        fields = ['id', 'value', 'investment_id', 'project_id', 'investment']


class BpProjectsSerializer(serializers.ModelSerializer):
    investment_id = PrimaryKeyRelatedField(source='investment', queryset=BpInvestment.objects.all())
    investment = BpInvestmentSerializer(many=False, read_only=True)
    project_id = PrimaryKeyRelatedField(source='project', queryset=Project.objects.all())
    value = serializers.CharField()

    class Meta:
        model = BpProject
        fields = ['id', 'year', 'value', 'investment_id', 'project_id', 'investment']


class ProjectSerializer(serializers.ModelSerializer):
    user_id = PrimaryKeyRelatedField(source='user', queryset=User.objects.all())
    params = JSONField()
    cases = CaseSerializer(many=True, read_only=True)
    oc_projects = OcProjectSerializer(many=True, read_only=True)
    bp_projects = BpProjectsSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'user_id', 'params', 'cases', 'oc_projects', 'bp_projects']


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'confirm_password', 'email')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match!"})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()

        return user
