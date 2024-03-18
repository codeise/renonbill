#!/bin/sh
cd /code || exit
echo "Waiting for postgres..."
while ! nc -z renonbill_db_1 5432; do sleep 1; done;
pip install --upgrade pip
pip install -r requirements.txt
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py runserver 0.0.0.0:8000