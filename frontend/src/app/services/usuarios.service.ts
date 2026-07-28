import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';

const USUARIOS_MOCK: Usuario[] = [
  { id: '00000000-0000-0000-0000-000000000001', nombre: 'Admin General', email: 'admin@pisunpa.com', rol: 'administrador', activo: true },
  { id: '00000000-0000-0000-0000-000000000002', nombre: 'Dr. Fernando Roa', email: 'roa@pisunpa.com', rol: 'director', activo: true },
  { id: '00000000-0000-0000-0000-000000000003', nombre: 'Ana María López', email: 'ana@pisunpa.com', rol: 'secretario', activo: true },
  { id: '00000000-0000-0000-0000-000000000004', nombre: 'Carlos Pérez', email: 'carlos@pisunpa.com', rol: 'profesor', activo: true },
  { id: '00000000-0000-0000-0000-000000000005', nombre: 'Juan Estudiante', email: 'juan@pisunpa.com', rol: 'egresado', activo: true },
  { id: '00000000-0000-0000-0000-000000000006', nombre: 'María Estudiante', email: 'maria@pisunpa.com', rol: 'estudiante', activo: true },
];

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private _usuarios = signal<Usuario[]>(USUARIOS_MOCK);
  private nextId = 7;

  usuarios = this._usuarios.asReadonly();

  guardar(usuario: Omit<Usuario, 'id'>): void {
    const nuevo: Usuario = { ...usuario, id: String(this.nextId++) };
    this._usuarios.update(list => [...list, nuevo]);
  }

  actualizar(usuario: Usuario): void {
    this._usuarios.update(list =>
      list.map(u => u.id === usuario.id ? usuario : u)
    );
  }

  eliminar(id: string): void {
    this._usuarios.update(list => list.filter(u => u.id !== id));
  }

  getById(id: string): Usuario | undefined {
    return this._usuarios().find(u => u.id === id);
  }
}
