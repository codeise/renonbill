# Generated by Django 3.2.2 on 2021-07-09 15:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20210705_1029'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='case',
            name='name',
        ),
    ]
