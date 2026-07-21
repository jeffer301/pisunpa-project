from django.contrib.auth import get_user_model

Usuario = get_user_model()

class UsuarioService:

    @staticmethod
    def registrar_usuario(datos_validados: dict) -> Usuario:
        """
        Servicio para la creación y registro seguro de usuarios en el sistema.
        """
        password = datos_validados.pop("password")
        usuario = Usuario(**datos_validados)
        usuario.set_password(password)
        usuario.save()
        return usuario