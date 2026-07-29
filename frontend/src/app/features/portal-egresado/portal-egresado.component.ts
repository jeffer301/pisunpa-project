import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FeedbackService } from '../../shared/services/feedback.service';

type TabId = 'perfil' | 'experiencia' | 'estudios' | 'documentos';
type Privacidad = 'publico' | 'privado' | 'universidad';
type ModalidadTrabajo = 'Presencial' | 'Remoto' | 'Híbrido' | 'Freelance';
type TipoContrato = 'Término indefinido' | 'Término fijo' | 'Prestación de servicios' | 'Obra o labor' | 'Independiente';
type RangoSalarial =
  | 'Menos de 2 SMMLV'
  | 'Entre 2 y 4 SMMLV'
  | 'Entre 4 y 6 SMMLV'
  | 'Entre 6 y 8 SMMLV'
  | 'Entre 8 y 10 SMMLV'
  | 'Más de 10 SMMLV';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

type TipoPosgrado = 'Especialización' | 'Maestría' | 'Doctorado';
type EstadoPosgrado = 'En curso' | 'Finalizado';

interface EstudioPosterior {
  id: number;
  tipo: 'Posgrado' | 'Certificación';
  nombre: string;
  institucion: string;
  pais?: string;
  tipoPosgrado?: TipoPosgrado;
  estado?: EstadoPosgrado;
  anioFinalizacion?: number;
}

interface ExperienciaLaboral {
  id: number;
  empresa: string;
  nit: string;
  sectorEconomico: string;
  cargo: string;
  fechaIngreso: string;
  fechaRetiro: string;
  cargoActual: boolean;
  modalidad: ModalidadTrabajo;
  tipoContrato: TipoContrato;
  rangoSalarial: RangoSalarial;
}

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  tamano: string;
  fechaCarga: string;
}

interface CompetenciaCategoria {
  categoria: string;
  items: string[];
}

@Component({
  selector: 'app-portal-egresado',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="portal">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Mi Portal</h2>
        </div>
        <nav class="sidebar-nav">
          @for (tab of tabs; track tab.id) {
            <button
              class="nav-item"
              [class.active]="activeTab() === tab.id"
              (click)="activeTab.set(tab.id)">
              <span class="nav-icon">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          }
        </nav>
      </aside>

      <main class="portal-content">
        @switch (activeTab()) {
          @case ('perfil') {
            <div class="perfil-tab">
              <div class="section-header">
                <h2>Mi Perfil</h2>
                <div class="privacidad-toggle">
                  @for (opt of privacidadOptions; track opt.value) {
                    <button
                      class="toggle-option"
                      [class.active]="privacidad() === opt.value"
                      (click)="privacidad.set(opt.value)">
                      {{ opt.label }}
                    </button>
                  }
                </div>
              </div>

              <form [formGroup]="perfilForm" (ngSubmit)="guardarPerfil()">
                <fieldset>
                  <legend>Información Básica y Contacto</legend>
                  <div class="form-grid">
                    <div class="campo">
                      <label for="nombres">Nombres *</label>
                      <input id="nombres" formControlName="nombres" type="text" />
                      @if (campoInvalido('nombres')) {
                        <span class="error">Los nombres son requeridos.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="apellidos">Apellidos *</label>
                      <input id="apellidos" formControlName="apellidos" type="text" />
                      @if (campoInvalido('apellidos')) {
                        <span class="error">Los apellidos son requeridos.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="cedula">Cédula *</label>
                      <input id="cedula" formControlName="cedula" type="text" />
                      @if (campoInvalido('cedula')) {
                        <span class="error">La cédula es requerida.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="email">Correo electrónico *</label>
                      <input id="email" formControlName="email" type="email" />
                      @if (campoInvalido('email')) {
                        <span class="error">El correo electrónico es requerido.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="telefono">Teléfono</label>
                      <input id="telefono" formControlName="telefono" type="tel" />
                    </div>
                    <div class="campo">
                      <label for="direccion">Dirección</label>
                      <input id="direccion" formControlName="direccion" type="text" />
                    </div>
                    <div class="campo">
                      <label for="ciudad">Ciudad</label>
                      <input id="ciudad" formControlName="ciudad" type="text" />
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Contacto de Emergencia</legend>
                  <div class="form-grid">
                    <div class="campo">
                      <label for="contactoNombre">Persona de contacto *</label>
                      <input id="contactoNombre" formControlName="contactoNombre" type="text" />
                      @if (campoInvalido('contactoNombre')) {
                        <span class="error">La persona de contacto es requerida.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="contactoParentesco">Parentesco *</label>
                      <input id="contactoParentesco" formControlName="contactoParentesco" type="text" />
                      @if (campoInvalido('contactoParentesco')) {
                        <span class="error">El parentesco es requerido.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="contactoTelefono">Teléfono *</label>
                      <input id="contactoTelefono" formControlName="contactoTelefono" type="tel" />
                      @if (campoInvalido('contactoTelefono')) {
                        <span class="error">El teléfono es requerido.</span>
                      }
                    </div>
                    <div class="campo">
                      <label for="contactoEmail">Correo electrónico</label>
                      <input id="contactoEmail" formControlName="contactoEmail" type="email" />
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Preferencias de Comunicación</legend>
                  <div class="preferencias-grid">
                    <div class="preferencia-group">
                      <h4>Canales de contacto</h4>
                      @for (canal of canalesOptions; track canal) {
                        <label class="checkbox-label">
                          <input type="checkbox" [formControlName]="'canal_' + canal" />
                          {{ canal }}
                        </label>
                      }
                    </div>
                    <div class="preferencia-group">
                      <h4>Temas de interés</h4>
                      @for (tema of temasOptions; track tema) {
                        <label class="checkbox-label">
                          <input type="checkbox" [formControlName]="'tema_' + tema" />
                          {{ tema }}
                        </label>
                      }
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Redes Profesionales</legend>
                  <div class="redes-grid">
                    @for (red of redesOptions; track red.key) {
                      <div class="red-row">
                        <div class="red-icon">{{ red.icon }}</div>
                        <div class="campo red-input">
                          <label [for]="'red-' + red.key">{{ red.label }}</label>
                          <input
                            [id]="'red-' + red.key"
                            [formControlName]="red.key"
                            type="url"
                            [placeholder]="red.placeholder" />
                        </div>
                        <div class="red-visibility">
                          <select [formControlName]="red.key + '_visibilidad'">
                            <option value="publico">Público</option>
                            <option value="privado">Privado</option>
                          </select>
                        </div>
                      </div>
                    }
                  </div>
                </fieldset>

                <div class="form-actions">
                  @if (mensajeExito()) {
                    <span class="exito">{{ mensajeExito() }}</span>
                  }
                  <button type="submit" [disabled]="guardando()">
                    {{ guardando() ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </form>

              <div class="cv-trigger">
                <button class="btn-cv" (click)="mostrarCV.set(true)">
                  <span class="cv-trigger-icon">📋</span>
                  Ver mi Hoja de Vida Digital
                </button>
              </div>
            </div>

            @if (mostrarCV()) {
              <div class="cv-overlay" (click)="mostrarCV.set(false)">
                <div class="cv-container" (click)="$event.stopPropagation()">
                  <div class="cv-header">
                    <div class="cv-header-actions">
                      <button class="btn-cv-export" (click)="descargarCV()">Descargar CV (PDF)</button>
                      <button class="btn-cv-close" (click)="mostrarCV.set(false)">✕</button>
                    </div>
                  </div>

                  <div class="cv-body">
                    <div class="cv-section cv-profile-hero">
                      <div class="cv-avatar">{{ cvInicial() }}</div>
                      <div class="cv-profile-info">
                        <h2>{{ cvNombre() || 'Sin nombre registrado' }}</h2>
                        <p class="cv-role">Ingeniero de Sistemas — Egresado Universidad del Pacífico</p>
                        <div class="cv-contact-row">
                          @if (perfilForm.get('email')!.value) {
                            <span>✉ {{ perfilForm.get('email')!.value }}</span>
                          }
                          @if (perfilForm.get('telefono')!.value) {
                            <span>📞 {{ perfilForm.get('telefono')!.value }}</span>
                          }
                          @if (perfilForm.get('ciudad')!.value) {
                            <span>📍 {{ perfilForm.get('ciudad')!.value }}</span>
                          }
                        </div>
                      </div>
                    </div>

                    @if (experiencias().length > 0) {
                      <div class="cv-section">
                        <h3>Experiencia Profesional</h3>
                        @for (exp of experiencias(); track exp.id) {
                          <div class="cv-entry">
                            <div class="cv-entry-header">
                              <strong>{{ exp.cargo }}</strong>
                              <span class="cv-entry-date">{{ exp.fechaIngreso | date:'MMM yyyy' }} — {{ exp.cargoActual ? 'Presente' : (exp.fechaRetiro | date:'MMM yyyy') }}</span>
                            </div>
                            <p class="cv-entry-sub">{{ exp.empresa }} · {{ exp.modalidad }} · {{ exp.tipoContrato }}</p>
                          </div>
                        }
                      </div>
                    }

                    @if (posgrados().length > 0) {
                      <div class="cv-section">
                        <h3>Formación Posgradual</h3>
                        @for (est of posgrados(); track est.id) {
                          <div class="cv-entry">
                            <div class="cv-entry-header">
                              <strong>{{ est.nombre }}</strong>
                              <span class="cv-entry-date">{{ est.anioFinalizacion || 'En curso' }}</span>
                            </div>
                            <p class="cv-entry-sub">{{ est.institucion }}{{ est.pais ? ' · ' + est.pais : '' }}{{ est.estado ? ' · ' + est.estado : '' }}</p>
                          </div>
                        }
                      </div>
                    }

                    @if (certificaciones().length > 0) {
                      <div class="cv-section">
                        <h3>Certificaciones</h3>
                        <div class="cv-cert-grid">
                          @for (cert of certificaciones(); track cert.id) {
                            <div class="cv-cert-chip">
                              <span class="cv-cert-name">{{ cert.nombre }}</span>
                              <span class="cv-cert-inst">{{ cert.institucion }}{{ cert.anioFinalizacion ? ' · ' + cert.anioFinalizacion : '' }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <div class="cv-section">
                      <h3>Competencias Técnicas</h3>
                      @for (cat of competenciasData; track cat.categoria) {
                        <div class="cv-competency-block">
                          <h4>{{ cat.categoria }}</h4>
                          <div class="cv-competency-badges">
                            @for (item of cat.items; track item) {
                              <span class="cv-comp-badge">{{ item }}</span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          }
          @case ('experiencia') {
            <div class="experiencia-tab">
              <h2>Experiencia Laboral</h2>

              <form [formGroup]="experienciaForm" (ngSubmit)="agregarExperiencia()" class="experiencia-form">
                <div class="form-grid">
                  <div class="campo">
                    <label for="exp-empresa">Empresa *</label>
                    <input id="exp-empresa" formControlName="empresa" type="text" />
                    @if (campoExpInvalido('empresa')) {
                      <span class="error">La empresa es requerida.</span>
                    }
                  </div>
                  <div class="campo">
                    <label for="exp-nit">NIT</label>
                    <input id="exp-nit" formControlName="nit" type="text" />
                  </div>
                  <div class="campo">
                    <label for="exp-sector">Sector económico *</label>
                    <input id="exp-sector" formControlName="sectorEconomico" type="text" />
                    @if (campoExpInvalido('sectorEconomico')) {
                      <span class="error">El sector económico es requerido.</span>
                    }
                  </div>
                  <div class="campo">
                    <label for="exp-cargo">Cargo *</label>
                    <input id="exp-cargo" formControlName="cargo" type="text" />
                    @if (campoExpInvalido('cargo')) {
                      <span class="error">El cargo es requerido.</span>
                    }
                  </div>
                  <div class="campo">
                    <label for="exp-fechaIngreso">Fecha de ingreso *</label>
                    <input id="exp-fechaIngreso" formControlName="fechaIngreso" type="date" />
                    @if (campoExpInvalido('fechaIngreso')) {
                      <span class="error">La fecha de ingreso es requerida.</span>
                    }
                  </div>
                  <div class="campo">
                    <label for="exp-fechaRetiro">Fecha de retiro</label>
                    <input
                      id="exp-fechaRetiro"
                      formControlName="fechaRetiro"
                      type="date"
                      [disabled]="experienciaForm.get('cargoActual')!.value" />
                  </div>
                  <div class="campo campo-checkbox">
                    <label class="checkbox-label">
                      <input type="checkbox" formControlName="cargoActual" (change)="onCargoActualChange()" />
                      Cargo actual
                    </label>
                  </div>
                  <div class="campo">
                    <label for="exp-modalidad">Modalidad de trabajo *</label>
                    <select id="exp-modalidad" formControlName="modalidad">
                      <option value="" disabled>Seleccione...</option>
                      @for (m of modalidades; track m) {
                        <option [value]="m">{{ m }}</option>
                      }
                    </select>
                    @if (campoExpInvalido('modalidad')) {
                      <span class="error">La modalidad es requerida.</span>
                    }
                  </div>
                  <div class="campo">
                    <label for="exp-contrato">Tipo de contrato *</label>
                    <select id="exp-contrato" formControlName="tipoContrato">
                      <option value="" disabled>Seleccione...</option>
                      @for (c of tiposContrato; track c) {
                        <option [value]="c">{{ c }}</option>
                      }
                    </select>
                    @if (campoExpInvalido('tipoContrato')) {
                      <span class="error">El tipo de contrato es requerido.</span>
                    }
                  </div>
                  <div class="campo">
                    <label for="exp-rango">Rango salarial *</label>
                    <select id="exp-rango" formControlName="rangoSalarial">
                      <option value="" disabled>Seleccione...</option>
                      @for (r of rangosSalariales; track r) {
                        <option [value]="r">{{ r }}</option>
                      }
                    </select>
                    @if (campoExpInvalido('rangoSalarial')) {
                      <span class="error">El rango salarial es requerido.</span>
                    }
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary">Agregar Experiencia</button>
                </div>
              </form>

              <div class="timeline-section">
                <h3>Historial Laboral</h3>
                @if (experiencias().length === 0) {
                  <p class="empty-timeline">No hay experiencias registradas.</p>
                } @else {
                  <div class="timeline">
                    @for (exp of experiencias(); track exp.id) {
                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-card">
                          <div class="timeline-card-header">
                            <h4>{{ exp.cargo }}</h4>
                            <span class="empresa-label">{{ exp.empresa }}</span>
                          </div>
                          <div class="timeline-period">
                            {{ exp.fechaIngreso | date:'MMM yyyy' }} — {{ exp.cargoActual ? 'Presente' : (exp.fechaRetiro | date:'MMM yyyy') }}
                          </div>
                          <div class="timeline-badges">
                            <span class="badge badge-modalidad">{{ exp.modalidad }}</span>
                            <span class="badge badge-salarial">{{ exp.rangoSalarial }}</span>
                            <span class="badge badge-contrato">{{ exp.tipoContrato }}</span>
                          </div>
                          @if (exp.nit || exp.sectorEconomico) {
                            <div class="timeline-meta">
                              @if (exp.sectorEconomico) {
                                <span>Sector: {{ exp.sectorEconomico }}</span>
                              }
                              @if (exp.nit) {
                                <span>NIT: {{ exp.nit }}</span>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
          @case ('estudios') {
            <div class="estudios-tab">
              <h2>Estudios Posteriores</h2>

              <div class="estudios-form-sections">
                <form [formGroup]="estudiosForm" (ngSubmit)="agregarEstudio()">
                  <fieldset>
                    <legend>Formación Posgradual</legend>
                    <div class="form-grid">
                      <div class="campo">
                        <label for="est-tipo">Tipo *</label>
                        <select id="est-tipo" formControlName="tipoPosgrado">
                          <option value="" disabled>Seleccione...</option>
                          @for (t of tiposPosgrado; track t) {
                            <option [value]="t">{{ t }}</option>
                          }
                        </select>
                      </div>
                      <div class="campo">
                        <label for="est-nombre">Nombre del programa *</label>
                        <input id="est-nombre" formControlName="nombre" type="text" />
                        @if (campoEstInvalido('nombre')) {
                          <span class="error">El nombre es requerido.</span>
                        }
                      </div>
                      <div class="campo">
                        <label for="est-institucion">Institución *</label>
                        <input id="est-institucion" formControlName="institucion" type="text" />
                        @if (campoEstInvalido('institucion')) {
                          <span class="error">La institución es requerida.</span>
                        }
                      </div>
                      <div class="campo">
                        <label for="est-pais">País</label>
                        <input id="est-pais" formControlName="pais" type="text" />
                      </div>
                      <div class="campo">
                        <label for="est-estado">Estado *</label>
                        <select id="est-estado" formControlName="estado">
                          <option value="" disabled>Seleccione...</option>
                          @for (e of estadosPosgrado; track e) {
                            <option [value]="e">{{ e }}</option>
                          }
                        </select>
                      </div>
                      <div class="campo">
                        <label for="est-anio">Año de finalización</label>
                        <input id="est-anio" formControlName="anioFinalizacion" type="number" min="1990" max="2099" />
                      </div>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn-primary">Agregar Posgrado</button>
                    </div>
                  </fieldset>
                </form>

                <form [formGroup]="certificacionForm" (ngSubmit)="agregarCertificacion()">
                  <fieldset>
                    <legend>Certificaciones y Educación Complementaria</legend>
                    <div class="form-grid">
                      <div class="campo">
                        <label for="cert-nombre">Nombre del Curso / Certificación *</label>
                        <input id="cert-nombre" formControlName="nombre" type="text" />
                        @if (campoCertInvalido('nombre')) {
                          <span class="error">El nombre es requerido.</span>
                        }
                      </div>
                      <div class="campo">
                        <label for="cert-institucion">Institución Emisora / Plataforma *</label>
                        <input id="cert-institucion" formControlName="institucion" type="text" placeholder="Ej: AWS, Scrum Alliance, Cisco, Platzi" />
                        @if (campoCertInvalido('institucion')) {
                          <span class="error">La institución es requerida.</span>
                        }
                      </div>
                      <div class="campo">
                        <label for="cert-anio">Año de obtención *</label>
                        <input id="cert-anio" formControlName="anioFinalizacion" type="number" min="1990" max="2099" />
                        @if (campoCertInvalido('anioFinalizacion')) {
                          <span class="error">El año es requerido.</span>
                        }
                      </div>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn-primary btn-cert">Agregar Certificación</button>
                    </div>
                  </fieldset>
                </form>
              </div>

              <div class="estudios-cards-section">
                <h3>Mis Estudios</h3>
                @if (estudios().length === 0) {
                  <p class="empty-timeline">No hay estudios registrados.</p>
                } @else {
                  <div class="estudios-grid">
                    @for (est of estudios(); track est.id) {
                      <div class="estudio-card" [class.card-posgrado]="est.tipo === 'Posgrado'" [class.card-certificacion]="est.tipo === 'Certificación'">
                        <div class="card-icon">
                          @if (est.tipo === 'Posgrado') {
                            🎓
                          } @else {
                            🏅
                          }
                        </div>
                        <div class="card-body">
                          <span class="badge" [class.badge-posgrado]="est.tipo === 'Posgrado'" [class.badge-certificacion]="est.tipo === 'Certificación'">
                            {{ est.tipo === 'Posgrado' ? est.tipoPosgrado : 'Certificación' }}
                          </span>
                          <h4>{{ est.nombre }}</h4>
                          <p class="card-institucion">{{ est.institucion }}</p>
                          <div class="card-meta">
                            @if (est.pais) {
                              <span>{{ est.pais }}</span>
                            }
                            @if (est.anioFinalizacion) {
                              <span>{{ est.anioFinalizacion }}</span>
                            }
                            @if (est.estado) {
                              <span class="badge" [class.badge-en-curso]="est.estado === 'En curso'" [class.badge-finalizado]="est.estado === 'Finalizado'">{{ est.estado }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
          @case ('documentos') {
            <div class="documentos-tab">
              <h2>Mis Documentos</h2>

              <div
                class="dropzone"
                [class.dropzone-active]="isDragOver()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave()"
                (drop)="onDrop($event)"
                (click)="fileInput.click()">
                <input
                  #fileInput
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple
                  hidden
                  (change)="onFileSelect($event)" />
                <div class="dropzone-content">
                  <span class="dropzone-icon">📁</span>
                  <p class="dropzone-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p class="dropzone-hint">Formatos aceptados: PDF, PNG, JPG — Máximo 10 MB</p>
                </div>
              </div>

              <div class="docs-list-section">
                <h3>Archivos cargados</h3>
                @if (documentos().length === 0) {
                  <p class="empty-timeline">No hay documentos cargados.</p>
                } @else {
                  <div class="docs-list">
                    @for (doc of documentos(); track doc.id) {
                      <div class="doc-item">
                        <div class="doc-icon">
                          @if (doc.tipo === 'application/pdf') {
                            📄
                          } @else {
                            🖼️
                          }
                        </div>
                        <div class="doc-info">
                          <span class="doc-name">{{ doc.nombre }}</span>
                          <span class="doc-meta">{{ doc.tamano }} · {{ doc.fechaCarga }}</span>
                        </div>
                        <div class="doc-actions">
                          <button class="btn-doc-action btn-doc-download" (click)="descargarDocumento(doc)">Descargar</button>
                          <button class="btn-doc-action btn-doc-delete" (click)="eliminarDocumento(doc)">Eliminar</button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: `
    :host { display: block; }

    .portal {
      display: flex;
      gap: 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .sidebar-header {
      background: var(--color-primary);
      color: #fff;
      padding: 1.25rem 1rem;
    }

    .sidebar-header h2 {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.7rem 0.75rem;
      border: none;
      background: transparent;
      color: #444;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
    }

    .nav-item:hover {
      background: var(--color-page);
      color: var(--color-primary);
    }

    .nav-item.active {
      background: #e8eeff;
      color: var(--color-primary);
      font-weight: 600;
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    .portal-content {
      flex: 1;
      min-width: 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .section-header h2 {
      font-size: 1.4rem;
      color: var(--color-primary);
    }

    .privacidad-toggle {
      display: flex;
      background: var(--color-page);
      border-radius: 6px;
      padding: 3px;
      gap: 2px;
    }

    .toggle-option {
      padding: 0.4rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .toggle-option.active {
      background: var(--color-primary);
      color: #fff;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .preferencias-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .preferencia-group h4 {
      font-size: 0.85rem;
      color: var(--color-primary);
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--color-primary);
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .form-actions .exito {
      margin-top: 0;
    }

    .form-actions button {
      margin-top: 0;
    }

    .btn-primary {
      background: var(--color-primary);
      color: #fff;
      padding: 0.6rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #163d8f;
    }

    .placeholder-tab {
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 4rem 2rem;
      text-align: center;
    }

    .placeholder-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .placeholder-tab h2 {
      font-size: 1.3rem;
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }

    .placeholder-tab p {
      color: #888;
      font-size: 0.95rem;
    }

    /* Experiencia Laboral */
    .experiencia-tab h2 {
      font-size: 1.4rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
    }

    .experiencia-form {
      margin-bottom: 2rem;
    }

    .campo-checkbox {
      display: flex;
      align-items: end;
      padding-bottom: 0.5rem;
    }

    .campo select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fff;
    }

    .campo select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(10, 36, 99, 0.15);
    }

    /* Timeline */
    .timeline-section h3 {
      font-size: 1.1rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .empty-timeline {
      text-align: center;
      color: #888;
      padding: 2rem;
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .timeline {
      position: relative;
      padding-left: 1.5rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #d0d7e8;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 1.25rem;
    }

    .timeline-dot {
      position: absolute;
      left: -1.5rem;
      top: 1.25rem;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--color-accent);
      border: 3px solid var(--color-surface);
      box-shadow: 0 0 0 2px var(--color-accent);
      z-index: 1;
    }

    .timeline-item:first-child .timeline-dot {
      background: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary);
    }

    .timeline-card {
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1rem 1.25rem;
    }

    .timeline-card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .timeline-card-header h4 {
      font-size: 1rem;
      color: #1a1a1a;
      font-weight: 600;
    }

    .empresa-label {
      font-size: 0.85rem;
      color: var(--color-primary);
      font-weight: 500;
    }

    .timeline-period {
      font-size: 0.8rem;
      color: #777;
      margin-bottom: 0.6rem;
    }

    .timeline-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-modalidad {
      background: #e8eeff;
      color: var(--color-primary);
    }

    .badge-salarial {
      background: #e0f4f1;
      color: #1a7a6d;
    }

    .badge-contrato {
      background: #fef3e2;
      color: #9a6c1e;
    }

    .timeline-meta {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #888;
    }

    /* Estudios Posteriores */
    .estudios-tab h2 {
      font-size: 1.4rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
    }

    .estudios-form-sections {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .estudios-form-sections fieldset {
      margin-bottom: 0;
    }

    .btn-cert {
      background: #1a7a6d;
    }

    .btn-cert:hover {
      background: #15655a;
    }

    .estudios-cards-section h3 {
      font-size: 1.1rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .estudios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .estudio-card {
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.25rem;
      display: flex;
      gap: 0.85rem;
      border-left: 4px solid transparent;
      transition: box-shadow 0.15s;
    }

    .estudio-card:hover {
      box-shadow: 0 4px 16px rgba(10, 36, 99, 0.15);
    }

    .card-posgrado {
      border-left-color: var(--color-primary);
    }

    .card-certificacion {
      border-left-color: var(--color-accent);
    }

    .card-icon {
      font-size: 1.8rem;
      flex-shrink: 0;
      width: 40px;
      text-align: center;
    }

    .card-body {
      flex: 1;
      min-width: 0;
    }

    .card-body h4 {
      font-size: 0.95rem;
      color: #1a1a1a;
      font-weight: 600;
      margin: 0.3rem 0 0.2rem;
    }

    .card-institucion {
      font-size: 0.82rem;
      color: #666;
      margin-bottom: 0.4rem;
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      font-size: 0.78rem;
      color: #888;
    }

    .badge-posgrado {
      background: #e8eeff;
      color: var(--color-primary);
    }

    .badge-certificacion {
      background: #e0f4f1;
      color: #1a7a6d;
    }

    .badge-en-curso {
      background: #fef3e2;
      color: #9a6c1e;
    }

    .badge-finalizado {
      background: #d4edda;
      color: #155724;
    }

    /* CV Trigger */
    .cv-trigger {
      margin-top: 1.5rem;
      text-align: center;
    }

    .btn-cv {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: linear-gradient(135deg, var(--color-primary), #163d8f);
      color: #fff;
      padding: 0.75rem 1.75rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(10, 36, 99, 0.3);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .btn-cv:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(10, 36, 99, 0.4);
    }

    .cv-trigger-icon {
      font-size: 1.2rem;
    }

    /* CV Overlay */
    .cv-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      justify-content: center;
      padding: 2rem;
      overflow-y: auto;
    }

    .cv-container {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 780px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .cv-header {
      background: var(--color-primary);
      padding: 1rem 1.5rem;
    }

    .cv-header-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-cv-export {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #fff;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 500;
      transition: background 0.15s;
    }

    .btn-cv-export:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .btn-cv-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .btn-cv-close:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .cv-body {
      padding: 2rem;
    }

    .cv-section {
      margin-bottom: 1.75rem;
    }

    .cv-section h3 {
      font-size: 1.05rem;
      color: var(--color-primary);
      font-weight: 700;
      margin-bottom: 0.75rem;
      padding-bottom: 0.4rem;
      border-bottom: 2px solid #e8eeff;
    }

    .cv-section h4 {
      font-size: 0.85rem;
      color: #555;
      font-weight: 600;
      margin-bottom: 0.4rem;
      margin-top: 0.75rem;
    }

    .cv-section h4:first-child {
      margin-top: 0;
    }

    .cv-profile-hero {
      display: flex;
      gap: 1.25rem;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f0f4ff, #e8f8f5);
      border-radius: 10px;
      border-bottom: none;
    }

    .cv-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .cv-profile-info h2 {
      font-size: 1.3rem;
      color: var(--color-primary);
      margin-bottom: 0.15rem;
    }

    .cv-role {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 0.4rem;
    }

    .cv-contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.8rem;
      color: #555;
    }

    .cv-entry {
      padding: 0.6rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .cv-entry:last-child {
      border-bottom: none;
    }

    .cv-entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .cv-entry-header strong {
      font-size: 0.9rem;
      color: #1a1a1a;
    }

    .cv-entry-date {
      font-size: 0.78rem;
      color: #888;
    }

    .cv-entry-sub {
      font-size: 0.82rem;
      color: #666;
      margin-top: 0.15rem;
    }

    .cv-cert-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .cv-cert-chip {
      background: #e0f4f1;
      border-radius: 8px;
      padding: 0.5rem 0.85rem;
      display: flex;
      flex-direction: column;
    }

    .cv-cert-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1a7a6d;
    }

    .cv-cert-inst {
      font-size: 0.75rem;
      color: #666;
    }

    .cv-competency-block {
      margin-bottom: 0.5rem;
    }

    .cv-competency-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .cv-comp-badge {
      background: #e8eeff;
      color: var(--color-primary);
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 500;
    }

    /* Documentos */
    .documentos-tab h2 {
      font-size: 1.4rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
    }

    .dropzone {
      border: 2px dashed #c5d0e6;
      border-radius: var(--radius);
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: var(--color-surface);
      margin-bottom: 1.5rem;
    }

    .dropzone:hover,
    .dropzone-active {
      border-color: var(--color-accent);
      background: #f0f8ff;
    }

    .dropzone-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .dropzone-text {
      font-size: 0.95rem;
      color: #444;
      font-weight: 500;
      margin-bottom: 0.3rem;
    }

    .dropzone-hint {
      font-size: 0.8rem;
      color: #999;
    }

    .docs-list-section h3 {
      font-size: 1.1rem;
      color: var(--color-primary);
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .docs-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 0.75rem 1rem;
    }

    .doc-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .doc-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .doc-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-meta {
      font-size: 0.78rem;
      color: #888;
    }

    .doc-actions {
      display: flex;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .btn-doc-action {
      padding: 0.3rem 0.65rem;
      border: none;
      border-radius: 5px;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-doc-download {
      background: #e8eeff;
      color: var(--color-primary);
    }

    .btn-doc-download:hover {
      background: #d0d7f0;
    }

    .btn-doc-delete {
      background: #fde8e8;
      color: var(--color-danger);
    }

    .btn-doc-delete:hover {
      background: #f5d0d0;
    }

    /* Redes Profesionales */
    .redes-grid {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .red-row {
      display: flex;
      align-items: end;
      gap: 0.75rem;
    }

    .red-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
      width: 32px;
      text-align: center;
      padding-bottom: 0.4rem;
    }

    .red-input {
      flex: 1;
      margin-bottom: 0;
    }

    .red-visibility {
      flex-shrink: 0;
      padding-bottom: 0;
    }

    .red-visibility select {
      padding: 0.5rem 0.6rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.82rem;
      background: #fff;
      min-width: 100px;
    }

    .red-visibility select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(10, 36, 99, 0.15);
    }

    @media (max-width: 720px) {
      .portal {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
      }

      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding: 0.5rem;
      }

      .nav-item {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .preferencias-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .timeline-card-header {
        flex-direction: column;
      }

      .estudios-grid {
        grid-template-columns: 1fr;
      }

      .cv-overlay {
        padding: 1rem;
      }

      .cv-profile-hero {
        flex-direction: column;
        text-align: center;
      }

      .cv-contact-row {
        justify-content: center;
      }

      .cv-entry-header {
        flex-direction: column;
      }

      .doc-item {
        flex-wrap: wrap;
      }

      .red-row {
        flex-wrap: wrap;
      }

      .red-visibility {
        width: 100%;
      }

      .red-visibility select {
        width: 100%;
      }
    }
  `,
})
export class PortalEgresadoComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private feedback = inject(FeedbackService);

  activeTab = signal<TabId>('perfil');
  privacidad = signal<Privacidad>('privado');
  mensajeExito = signal('');
  guardando = signal(false);

  private nextId = 3;

  experiencias = signal<ExperienciaLaboral[]>([
    {
      id: 1,
      empresa: 'TechColombia S.A.S.',
      nit: '900123456-7',
      sectorEconomico: 'Tecnología',
      cargo: 'Desarrollador Backend',
      fechaIngreso: '2023-03-01',
      fechaRetiro: '',
      cargoActual: true,
      modalidad: 'Híbrido',
      tipoContrato: 'Término indefinido',
      rangoSalarial: 'Entre 4 y 6 SMMLV',
    },
    {
      id: 2,
      empresa: 'Startup Creativa Ltda.',
      nit: '',
      sectorEconomico: 'Medios Digitales',
      cargo: 'Ingeniero de Software Trainee',
      fechaIngreso: '2021-07-15',
      fechaRetiro: '2023-01-31',
      cargoActual: false,
      modalidad: 'Remoto',
      tipoContrato: 'Prestación de servicios',
      rangoSalarial: 'Entre 2 y 4 SMMLV',
    },
  ]);

  private nextEstudioId = 3;

  estudios = signal<EstudioPosterior[]>([
    {
      id: 1,
      tipo: 'Posgrado',
      nombre: 'Maestría en Ingeniería de Software',
      institucion: 'Universidad de los Andes',
      pais: 'Colombia',
      tipoPosgrado: 'Maestría',
      estado: 'En curso',
      anioFinalizacion: 2027,
    },
    {
      id: 2,
      tipo: 'Certificación',
      nombre: 'AWS Certified Cloud Practitioner',
      institucion: 'Amazon Web Services',
      anioFinalizacion: 2024,
    },
  ]);

  mostrarCV = signal(false);
  isDragOver = signal(false);

  private nextDocId = 3;

  documentos = signal<Documento[]>([
    {
      id: 1,
      nombre: 'Diploma_Pregrado.pdf',
      tipo: 'application/pdf',
      tamano: '2.4 MB',
      fechaCarga: '15/06/2024',
    },
    {
      id: 2,
      nombre: 'Certificacion_AWS.pdf',
      tipo: 'application/pdf',
      tamano: '1.1 MB',
      fechaCarga: '20/08/2024',
    },
  ]);

  readonly competenciasData: CompetenciaCategoria[] = [
    {
      categoria: 'Lenguajes de Programación',
      items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
    },
    {
      categoria: 'Desarrollo Web',
      items: ['Angular', 'React', 'Node.js', 'HTML/CSS', 'REST APIs', 'GraphQL'],
    },
    {
      categoria: 'Bases de Datos',
      items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'],
    },
    {
      categoria: 'Computación en la Nube',
      items: ['AWS', 'Azure', 'Docker', 'Firebase'],
    },
    {
      categoria: 'Inteligencia Artificial',
      items: ['Machine Learning', 'TensorFlow', 'Scikit-learn', 'Procesamiento de Lenguaje Natural'],
    },
    {
      categoria: 'DevOps',
      items: ['CI/CD', 'GitHub Actions', 'Jenkins', 'Kubernetes', 'Terraform'],
    },
    {
      categoria: 'Competencias Blandas',
      items: ['Trabajo en equipo', 'Comunicación efectiva', 'Pensamiento crítico', 'Gestión de proyectos', 'Liderazgo'],
    },
  ];

  cvNombre = computed(() => {
    const nombres = this.perfilForm?.get('nombres')?.value || '';
    const apellidos = this.perfilForm?.get('apellidos')?.value || '';
    return [nombres, apellidos].filter(Boolean).join(' ');
  });

  cvInicial = computed(() => {
    const n = this.perfilForm?.get('nombres')?.value || '';
    const a = this.perfilForm?.get('apellidos')?.value || '';
    return (n.charAt(0) + a.charAt(0)).toUpperCase() || '?';
  });

  posgrados = computed(() => this.estudios().filter(e => e.tipo === 'Posgrado'));
  certificaciones = computed(() => this.estudios().filter(e => e.tipo === 'Certificación'));

  readonly tabs: Tab[] = [
    { id: 'perfil', label: 'Mi Perfil', icon: '👤' },
    { id: 'experiencia', label: 'Experiencia Laboral', icon: '💼' },
    { id: 'estudios', label: 'Estudios Posteriores', icon: '🎓' },
    { id: 'documentos', label: 'Mis Documentos', icon: '📄' },
  ];

  readonly privacidadOptions = [
    { value: 'publico' as Privacidad, label: 'Público' },
    { value: 'privado' as Privacidad, label: 'Privado' },
    { value: 'universidad' as Privacidad, label: 'Solo Universidad' },
  ];

  readonly canalesOptions = ['Correo electrónico', 'SMS', 'WhatsApp'];
  readonly temasOptions = ['Bolsa de empleo', 'Cursos', 'Eventos', 'Investigación', 'Convocatorias'];
  readonly redesOptions = [
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/tu-perfil' },
    { key: 'github', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/tu-usuario' },
    { key: 'gitlab', label: 'GitLab', icon: '🦊', placeholder: 'https://gitlab.com/tu-usuario' },
    { key: 'portafolio', label: 'Portafolio Personal', icon: '🌐', placeholder: 'https://tusitio.com' },
  ];
  readonly modalidades: ModalidadTrabajo[] = ['Presencial', 'Remoto', 'Híbrido', 'Freelance'];
  readonly tiposContrato: TipoContrato[] = ['Término indefinido', 'Término fijo', 'Prestación de servicios', 'Obra o labor', 'Independiente'];
  readonly rangosSalariales: RangoSalarial[] = [
    'Menos de 2 SMMLV',
    'Entre 2 y 4 SMMLV',
    'Entre 4 y 6 SMMLV',
    'Entre 6 y 8 SMMLV',
    'Entre 8 y 10 SMMLV',
    'Más de 10 SMMLV',
  ];

  readonly tiposPosgrado: TipoPosgrado[] = ['Especialización', 'Maestría', 'Doctorado'];
  readonly estadosPosgrado: EstadoPosgrado[] = ['En curso', 'Finalizado'];

  perfilForm!: FormGroup;
  experienciaForm!: FormGroup;
  estudiosForm!: FormGroup;
  certificacionForm!: FormGroup;

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
      ciudad: [''],
      contactoNombre: ['', Validators.required],
      contactoParentesco: ['', Validators.required],
      contactoTelefono: ['', Validators.required],
      contactoEmail: [''],
      ...Object.fromEntries(this.canalesOptions.map(c => ['canal_' + c, false])),
      ...Object.fromEntries(this.temasOptions.map(t => ['tema_' + t, false])),
      linkedin: [''],
      linkedin_visibilidad: ['publico'],
      github: [''],
      github_visibilidad: ['publico'],
      gitlab: [''],
      gitlab_visibilidad: ['publico'],
      portafolio: [''],
      portafolio_visibilidad: ['publico'],
    });

    this.experienciaForm = this.fb.group({
      empresa: ['', Validators.required],
      nit: [''],
      sectorEconomico: ['', Validators.required],
      cargo: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      fechaRetiro: [''],
      cargoActual: [false],
      modalidad: ['', Validators.required],
      tipoContrato: ['', Validators.required],
      rangoSalarial: ['', Validators.required],
    });

    this.estudiosForm = this.fb.group({
      tipoPosgrado: [''],
      nombre: ['', Validators.required],
      institucion: ['', Validators.required],
      pais: [''],
      estado: [''],
      anioFinalizacion: [null],
    });

    this.certificacionForm = this.fb.group({
      nombre: ['', Validators.required],
      institucion: ['', Validators.required],
      anioFinalizacion: [null, Validators.required],
    });
  }

  ngOnDestroy(): void {
    // cleanup handled by FeedbackService internally
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.perfilForm.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  campoExpInvalido(campo: string): boolean {
    const ctrl = this.experienciaForm.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  campoEstInvalido(campo: string): boolean {
    const ctrl = this.estudiosForm.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  campoCertInvalido(campo: string): boolean {
    const ctrl = this.certificacionForm.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  onCargoActualChange(): void {
    const esCargoActual = this.experienciaForm.get('cargoActual')!.value;
    const fechaRetiro = this.experienciaForm.get('fechaRetiro')!;
    if (esCargoActual) {
      fechaRetiro.setValue('');
      fechaRetiro.disable();
    } else {
      fechaRetiro.enable();
    }
  }

  agregarExperiencia(): void {
    if (this.experienciaForm.invalid) {
      this.experienciaForm.markAllAsTouched();
      return;
    }

    const val = this.experienciaForm.value;
    const nueva: ExperienciaLaboral = {
      id: this.nextId++,
      empresa: val.empresa,
      nit: val.nit || '',
      sectorEconomico: val.sectorEconomico,
      cargo: val.cargo,
      fechaIngreso: val.fechaIngreso,
      fechaRetiro: val.cargoActual ? '' : (val.fechaRetiro || ''),
      cargoActual: val.cargoActual,
      modalidad: val.modalidad,
      tipoContrato: val.tipoContrato,
      rangoSalarial: val.rangoSalarial,
    };

    this.experiencias.update(lista => [nueva, ...lista]);

    this.experienciaForm.reset({
      empresa: '',
      nit: '',
      sectorEconomico: '',
      cargo: '',
      fechaIngreso: '',
      fechaRetiro: '',
      cargoActual: false,
      modalidad: '',
      tipoContrato: '',
      rangoSalarial: '',
    });

    this.feedback.show('Experiencia laboral registrada exitosamente.', 'success');
  }

  agregarEstudio(): void {
    if (this.estudiosForm.invalid) {
      this.estudiosForm.markAllAsTouched();
      return;
    }

    const val = this.estudiosForm.value;
    const nuevo: EstudioPosterior = {
      id: this.nextEstudioId++,
      tipo: 'Posgrado',
      nombre: val.nombre,
      institucion: val.institucion,
      pais: val.pais || undefined,
      tipoPosgrado: val.tipoPosgrado || undefined,
      estado: val.estado || undefined,
      anioFinalizacion: val.anioFinalizacion || undefined,
    };

    this.estudios.update(lista => [nuevo, ...lista]);

    this.estudiosForm.reset({
      tipoPosgrado: '',
      nombre: '',
      institucion: '',
      pais: '',
      estado: '',
      anioFinalizacion: null,
    });

    this.feedback.show('Posgrado registrado exitosamente.', 'success');
  }

  agregarCertificacion(): void {
    if (this.certificacionForm.invalid) {
      this.certificacionForm.markAllAsTouched();
      return;
    }

    const val = this.certificacionForm.value;
    const nueva: EstudioPosterior = {
      id: this.nextEstudioId++,
      tipo: 'Certificación',
      nombre: val.nombre,
      institucion: val.institucion,
      anioFinalizacion: val.anioFinalizacion || undefined,
    };

    this.estudios.update(lista => [nueva, ...lista]);

    this.certificacionForm.reset({
      nombre: '',
      institucion: '',
      anioFinalizacion: null,
    });

    this.feedback.show('Certificación registrada exitosamente.', 'success');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files) {
      this.procesarArchivos(files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.procesarArchivos(input.files);
      input.value = '';
    }
  }

  private procesarArchivos(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        this.feedback.show(`"${file.name}" no es un formato aceptado.`, 'error');
        continue;
      }
      const tamano = file.size < 1024 * 1024
        ? (file.size / 1024).toFixed(1) + ' KB'
        : (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const ahora = new Date();
      const fechaCarga = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()}`;
      const doc: Documento = {
        id: this.nextDocId++,
        nombre: file.name,
        tipo: file.type,
        tamano,
        fechaCarga,
      };
      this.documentos.update(lista => [...lista, doc]);
    }
    this.feedback.show('Documento(s) cargado(s) exitosamente.', 'success');
  }

  descargarDocumento(doc: Documento): void {
    this.feedback.show(`Descargando "${doc.nombre}"...`, 'success');
  }

  eliminarDocumento(doc: Documento): void {
    this.documentos.update(lista => lista.filter(d => d.id !== doc.id));
    this.feedback.show(`"${doc.nombre}" eliminado.`, 'success');
  }

  descargarCV(): void {
    const hasData = this.cvNombre() || this.experiencias().length > 0 || this.estudios().length > 0;
    if (!hasData) {
      this.feedback.show('No hay información suficiente para generar el CV.', 'error');
      return;
    }
    this.feedback.show('Generando Hoja de Vida en PDF...', 'success');
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    // TODO: connect to backend service
    setTimeout(() => {
      this.mensajeExito.set('Perfil guardado exitosamente.');
      this.guardando.set(false);
      setTimeout(() => this.mensajeExito.set(''), 3000);
    }, 800);
  }
}
