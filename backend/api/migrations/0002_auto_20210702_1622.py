# Generated by Django 3.2.2 on 2021-07-02 16:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='case',
            table='cases',
        ),
        migrations.AlterModelTable(
            name='project',
            table='projects',
        ),
    ]
