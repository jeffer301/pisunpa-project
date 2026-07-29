import unicodedata

from django.core.management.base import BaseCommand
from django.db import transaction
from app.egresados.models import Programa


def normalize(name: str) -> str:
    return (
        unicodedata.normalize('NFD', name)
        .encode('ascii', 'ignore')
        .decode('utf-8')
        .lower()
        .strip()
    )


class Command(BaseCommand):
    help = (
        'Unifica programas duplicados por variaciones de tilde/case. '
        'Mueve todas las FK hacia el registro canónico y elimina los sobrantes.'
    )

    def handle(self, *args, **options):
        all_programas = list(Programa.objects.all())
        groups: dict[str, list[Programa]] = {}
        for p in all_programas:
            key = normalize(p.nombre)
            groups.setdefault(key, []).append(p)

        duplicates_found = 0
        deleted = 0

        for key, members in groups.items():
            if len(members) <= 1:
                continue

            canonical = self._pick_canonical(members)
            duplicates = [m for m in members if m.id != canonical.id]
            duplicates_found += len(duplicates)

            self.stdout.write(
                f'  "{canonical.nombre}" (canonical) <- '
                f'{[d.nombre for d in duplicates]}'
            )

            with transaction.atomic():
                self._repoint_fk(canonical, duplicates)
                for dup in duplicates:
                    dup.delete()
                    deleted += 1

        if duplicates_found == 0:
            self.stdout.write(self.style.SUCCESS('No hay duplicados.'))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Unificados {deleted} registros duplicados '
                    f'hacia {duplicates_found} canónicos.'
                )
            )

    def _pick_canonical(self, members: list[Programa]) -> Programa:
        def score(p: Programa) -> tuple:
            name = p.nombre
            has_upper = any(c.isupper() for c in name)
            has_accent = any(
                unicodedata.category(c).startswith('M') for c in name
            )
            has_refs = (
                p.asignaturas.exists()
                or p.perfil_egresado_set.exists()
            )
            return (has_refs, has_upper and has_accent, has_upper, len(name))

        return max(members, key=score)

    def _repoint_fk(self, canonical: Programa, duplicates: list[Programa]):
        dup_ids = [d.id for d in duplicates]

        for model_field in self._find_fk_fields():
            model = model_field.related_model
            field_name = model_field.attname
            qs = model.objects.filter(**{f'{field_name}__in': dup_ids})
            count = qs.count()
            if count:
                qs.update(**{field_name: canonical.id})
                self.stdout.write(
                    f'    FK {model.__name__}.{field_name}: '
                    f'{count} registros reapuntados'
                )

    def _find_fk_fields(self):
        from django.apps import apps

        for model in apps.get_models():
            for field in model._meta.get_fields():
                if (
                    getattr(field, 'related_model', None) == Programa
                    and hasattr(field, 'attname')
                ):
                    yield field
