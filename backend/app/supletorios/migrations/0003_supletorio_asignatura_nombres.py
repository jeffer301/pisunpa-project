import uuid

from django.db import migrations


def corregir_asignaturas(apps, schema_editor):
    Supletorio = apps.get_model('supletorios', 'Supletorio')
    Asignatura = apps.get_model('egresados', 'Asignatura')
    for s in Supletorio.objects.exclude(asignatura=''):
        valor = s.asignatura
        try:
            uuid.UUID(valor)
        except (ValueError, TypeError):
            continue
        asignatura = Asignatura.objects.filter(pk=valor).first()
        if asignatura and asignatura.nombre != valor:
            s.asignatura = asignatura.nombre
            s.save(update_fields=['asignatura'])


class Migration(migrations.Migration):

    dependencies = [
        ('supletorios', '0002_supletorio_id_programa_uuid'),
    ]

    operations = [
        migrations.RunPython(corregir_asignaturas, migrations.RunPython.noop),
    ]
