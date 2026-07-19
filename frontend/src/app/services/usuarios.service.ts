import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';

const USUARIOS_MOCK: Usuario[] = [
  { id: 1, nombre: 'Admin General', email: 'admin@pisunpa.com', rol: 'administrador', activo: true },
  { id: 2, nombre: 'Dr. Fernando Roa', email: 'roa@pisunpa.com', rol: 'director', activo: true },
  { id: 3, nombre: 'Ana María López', email: 'ana@pisunpa.com', rol: 'secretario', activo: true },
  { id: 4, nombre: 'Carlos Pérez', email: 'carlos@pisunpa.com', rol: 'profesor', activo: true },
  { id: 5, nombre: 'Juan Estudiante', email: 'juan@pisunpa.com', rol: 'egresado', activo: true },
  { id: 6, nombre: 'María Estudiante', email: 'maria@pisunpa.com', rol: 'estudiante', activo: true },
];

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private _usuarios = signal<Usuario[]>(USUARIOS_MOCK);
  private nextId = 6;

  usuarios = this._usuarios.asReadonly();

  guardar(usuario: Omit<Usuario, 'id'>): void {
    const nuevo: Usuario = { ...usuario, id: this.nextId++ };
    this._usuarios.update(list => [...list, nuevo]);
  }

  actualizar(usuario: Usuario): void {
    this._usuarios.update(list =>
      list.map(u => u.id === usuario.id ? usuario : u)
    );
  }

  eliminar(id: number): void {
    this._usuarios.update(list => list.filter(u => u.id !== id));
  }

  getById(id: number): Usuario | undefined {
    return this._usuarios().find(u => u.id === id);
  }
}
