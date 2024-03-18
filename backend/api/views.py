import os

from django.contrib.auth.models import User
from django.http import Http404, HttpResponse
from django.shortcuts import render
from django.views import View
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenRefreshSerializer, TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenViewBase

import backend.settings
from .models import Project, Case, Constants
from .serializers import ProjectSerializer, CaseSerializer, ConstantsSerializer, CustomTokenObtainPairSerializer
from django.utils.translation import gettext_lazy as _


class ReactAppView(View):
    def get(self, request):
        path = os.path.join(backend.settings.BASE_DIR, "../", "frontend", "build")
        try:
            # return HttpResponse(path)
            with open(os.path.join(path, "index.html")) as file:
                return HttpResponse(file.read())
        except Exception as e:
            return HttpResponse(e, status=404)


class ReactAppView1(View):
    def get(self, request, boo):
        path = os.path.join(backend.settings.BASE_DIR, "../", "frontend", "build")
        try:
            # return HttpResponse(boo)
            with open(os.path.join(path, boo), 'rb') as file:
                return HttpResponse(file.read())
        except Exception as e:
            return HttpResponse(e, status=404)


class ReactAppView2(View):
    def get(self, request, boo):
        path = os.path.join(backend.settings.BASE_DIR, "../", "frontend", "build")
        try:
            # return HttpResponse(boo)
            with open(os.path.join(path, boo), 'rb') as file:
                return HttpResponse(file.read(), content_type='application/javascript')
        except Exception as e:
            return HttpResponse(e, status=404)


class ReactAppView3(View):
    def get(self, request, boo):
        path = os.path.join(backend.settings.BASE_DIR, "../", "frontend", "build")
        try:
            # return HttpResponse(boo)
            with open(os.path.join(path, boo), 'rb') as file:
                return HttpResponse(file.read(), content_type='text/css')
        except Exception as e:
            return HttpResponse(e, status=404)


class CustomInvalidToken(AuthenticationFailed):
    status_code = status.HTTP_302_FOUND
    default_detail = _('Token is invalid or expired')
    default_code = 'token_not_valid'


class CustomTokenObtainPairView(TokenViewBase):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token pair to prove the authentication of those credentials.
    """
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user_id = User.objects.filter(username=request.data["username"]).first().id
            response_data = {**serializer.validated_data, "user_id": user_id}
        except TokenError as e:
            raise CustomInvalidToken(e.args[0])

        return Response(response_data, status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super(CustomTokenRefreshView, self).post(request, args, kwargs)
        # if request.user.is_anonymous: TODO: enable this check in a middleware
        #     raise InvalidToken()
        # else:
        return response

    serializer_class = TokenRefreshSerializer


class ProjectList(APIView):
    def get(self, request):
        projects = Project.objects.all().order_by('pk')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetail(APIView):
    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CaseList(APIView):
    def get(self, request):
        cases = Case.objects.all()
        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CaseDetail(APIView):
    def get_object(self, pk):
        try:
            return Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        case = self.get_object(pk)
        serializer = CaseSerializer(case)
        return Response(serializer.data)

    def put(self, request, pk):
        case = self.get_object(pk)
        serializer = CaseSerializer(case, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        case = self.get_object(pk)
        case.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConstantsList(APIView):
    def get(self, request):
        consants = Constants.objects.all()
        serializer = ConstantsSerializer(consants, many=True)
        return Response(serializer.data)

    def post(self, request):
        user_id = request.data['user_id']
        constants = Constants.objects.all().filter(user_id=user_id).first()
        if not constants:
            serializer = ConstantsSerializer(data=request.data)
        else:
            serializer = ConstantsSerializer(constants, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConstantsDetail(APIView):
    def get_object(self, pk):
        try:
            return Constants.objects.get(pk=pk)
        except Constants.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        consants = self.get_object(pk)
        serializer = ConstantsSerializer(consants)
        return Response(serializer.data)

    def delete(self, request, pk):
        consants = self.get_object(pk)
        consants.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
