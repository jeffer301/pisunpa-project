from django.db import migrations, models


def limpiar_id_programa(apps, schema_editor):
    """Los id_programa históricos eran enteros sin relación con Programa (UUID)."""
    Supletorio = apps.get_model('supletorios', 'Supletorio')
    Supletorio.objects.update(id_programa=None)


class Migration(migrations.Migration):

    dependencies = [
        ('supletorios', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supletorio',
            name='id_programa',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.RunPython(limpiar_id_programa, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='supletorio',
            name='id_programa',
            field=models.UUIDField(null=True, blank=True),
        ),
    ]
