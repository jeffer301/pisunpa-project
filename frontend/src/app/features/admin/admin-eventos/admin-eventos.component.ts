import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventosService } from '../../../services/eventos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { Evento, EventoWrite, InscripcionEvento } from '../../../models/evento.model';

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-eventos.component.html',
  styleUrls: ['./admin-eventos.component.scss'],
})
export class AdminEventosComponent implements OnInit {
  private eventosService = inject(EventosService);
  private auth = inject(AuthService);
  private feedback = inject(FeedbackService);
  private fb = inject(FormBuilder);

  eventos = signal<Evento[]>([]);
  cargando = signal(false);
  inscritos = signal<InscripcionEvento[]>([]);
  eventoSeleccionado = signal<Evento | null>(null);
  mostrandoFormulario = signal(false);
  imagenSeleccionada = signal<File | null>(null);
  imagenActual = signal<string | null>(null);
  esCoordinador = this.auth.tienePermiso('escribir') || this.auth.esCoordinador();
  puedeVerInscritos = this.esCoordinador || this.auth.esSoloLectura();

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    fecha: ['', Validators.required],
    hora: [''],
    lugar: [''],
    capacidad: [null as number | null],
  });

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.cargando.set(true);
    this.eventosService.listar().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.feedback.show(err.error?.detail ?? 'No se pudieron cargar los eventos.', 'error');
      },
    });
  }

  nuevoEvento(): void {
    this.eventoSeleccionado.set(null);
    this.form.reset();
    this.imagenSeleccionada.set(null);
    this.imagenActual.set(null);
    this.mostrandoFormulario.set(true);
  }

  editarEvento(evento: Evento): void {
    this.eventoSeleccionado.set(evento);
    this.form.patchValue({
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      fecha: evento.fecha,
      hora: evento.hora ?? '',
      lugar: evento.lugar,
      capacidad: evento.capacidad,
    });
    this.imagenSeleccionada.set(null);
    this.imagenActual.set(this.eventosService.urlImagen(evento.imagen));
    this.mostrandoFormulario.set(true);
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.imagenSeleccionada.set(archivo);
    this.imagenActual.set(archivo ? URL.createObjectURL(archivo) : this.imagenActual());
  }

  guardar(): void {
    if (this.form.invalid) {
      this.feedback.show('Completa los campos obligatorios.', 'error');
      return;
    }
    const v = this.form.value;
    const payload: EventoWrite = {
      nombre: v.nombre ?? '',
      descripcion: v.descripcion ?? '',
      fecha: v.fecha ?? '',
      hora: v.hora ?? null,
      lugar: v.lugar ?? '',
      capacidad: v.capacidad ?? null,
    };
    const actualizar = this.eventoSeleccionado()
      ? this.eventosService.actualizar(
          this.eventoSeleccionado()!.id, payload, this.imagenSeleccionada()
        )
      : this.eventosService.crear(payload, this.imagenSeleccionada());
    actualizar.subscribe({
      next: () => {
        this.feedback.show(
          this.eventoSeleccionado() ? 'Evento actualizado.' : 'Evento creado.'
        );
        this.mostrandoFormulario.set(false);
        this.cargarEventos();
      },
      error: (err) => this.feedback.show(err.error?.detail ?? 'No fue posible guardar el evento.', 'error'),
    });
  }

  eliminarEvento(evento: Evento): void {
    this.eventosService.eliminar(evento.id).subscribe({
      next: () => {
        this.feedback.show('Evento eliminado.');
        this.cargarEventos();
      },
      error: (err) => this.feedback.show(err.error?.detail ?? 'No fue posible eliminar el evento.', 'error'),
    });
  }

  verInscritos(evento: Evento): void {
    this.eventoSeleccionado.set(evento);
    this.inscritos.set([]);
    this.eventosService.inscritos(evento.id).subscribe({
      next: (inscritos) => this.inscritos.set(inscritos),
      error: (err) => this.feedback.show(err.error?.detail ?? 'No se pudieron cargar los inscritos.', 'error'),
    });
  }

  cerrarInscritos(): void {
    this.inscritos.set([]);
    this.eventoSeleccionado.set(null);
  }
}
