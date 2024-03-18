# Generated by Django 3.2.2 on 2022-01-23 09:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_alter_project_report_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='BpInvestment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'bp_investments',
            },
        ),
        migrations.CreateModel(
            name='OcProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.TextField()),
                ('investment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='oc_projects', to='api.bpinvestment')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='oc_projects', to='api.project')),
            ],
            options={
                'db_table': 'oc_projects',
            },
        ),
        migrations.CreateModel(
            name='BpProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField()),
                ('value', models.TextField()),
                ('investment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bp_projects', to='api.bpinvestment')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bp_projects', to='api.project')),
            ],
            options={
                'db_table': 'bp_projects',
            },
        ),
        migrations.CreateModel(
            name='BpCase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField()),
                ('renovation_count', models.IntegerField()),
                ('government_subsidy', models.IntegerField()),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bp_cases', to='api.case')),
            ],
            options={
                'db_table': 'bp_cases',
            },
        ),
    ]
