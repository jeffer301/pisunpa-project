import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DocentePerfil {
  id: number;
  nombre: string;
  cargo: string;
  categoria: 'Administrativo' | 'Docente';
  titulos: string[];
  experienciaAnos: number;
  materias: string[];
  perfilMini: string;
  perfilCompleto: string;
  fotoUrl: string;
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      overflow-x: hidden;
    }

    /* ===== NAVBAR ===== */
    .landing-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid #e2e8f0;
      padding: 0.85rem 2.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .header-container { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
    .brand-group { display: flex; align-items: center; gap: 1rem; text-decoration: none; }
    .brand-logo-img { height: 48px; width: auto; object-fit: contain; }
    .brand-text { display: flex; flex-direction: column; }
    .brand-title-small { color: #0f172a; font-size: 1rem; font-weight: 900; letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.15; }
    .brand-sub-small { color: #15803d; font-size: 0.74rem; font-weight: 700; }

    .nav-menu { display: flex; align-items: center; gap: 2rem; list-style: none; margin: 0; padding: 0; }
    .nav-menu a { color: #475569; text-decoration: none; font-size: 0.88rem; font-weight: 600; transition: color 0.2s ease; cursor: pointer; }
    .nav-menu a.active, .nav-menu a:hover { color: #15803d; }

    .nav-actions { display: flex; align-items: center; gap: 0.85rem; }
    .btn-login-outline { padding: 0.55rem 1.35rem; border: 2px solid #15803d; border-radius: 8px; color: #15803d; font-size: 0.88rem; font-weight: 700; text-decoration: none; background: transparent; }
    .btn-login-outline:hover { background: #15803d; color: #ffffff; }
    .btn-register-solid { padding: 0.6rem 1.35rem; background: linear-gradient(135deg, #15803d 0%, #166534 100%); color: #ffffff; border-radius: 8px; font-size: 0.88rem; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(21, 128, 61, 0.4); }

    /* HERO PHOTO BACKGROUND */
    .page-hero {
      position: relative;
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 9rem 4rem 5rem;
      background: #0f172a;
      overflow: hidden;
    }

    .hero-bg-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.85;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.65) 60%, rgba(15, 23, 42, 0.3) 100%);
    }

    .page-hero-container {
      position: relative;
      z-index: 10;
      max-width: 650px;
      margin: 0;
      text-align: left;
    }

    .page-hero-tag {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(74, 222, 128, 0.2);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.3);
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 1.25rem;
    }

    .page-hero h1 {
      font-size: 3.2rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.035em;
      line-height: 1.1;
      margin-bottom: 1.25rem;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .page-hero h1 span {
      color: #4ade80;
    }

    .page-hero p {
      font-size: 1.1rem;
      color: #e2e8f0;
      line-height: 1.65;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .page-body { padding: 5rem 2rem; max-width: 1240px; margin: 0 auto; }

    .docentes-sub-header { margin-top: 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
    .docentes-sub-header h3 { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .docentes-badge-pill { background: #e2e8f0; color: #334155; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.65rem; border-radius: 12px; }

    .docentes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem; margin-bottom: 4rem; }

    .docente-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .docente-card:hover {
      border-color: #15803d;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(21, 128, 61, 0.1);
    }

    .docente-card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .docente-photo { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; border: 2px solid #15803d; flex-shrink: 0; }
    .docente-meta h5 { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 0.15rem; }
    .docente-cargo { font-size: 0.8rem; font-weight: 700; color: #15803d; }
    .docente-exp-tag { font-size: 0.73rem; font-weight: 700; color: #64748b; margin-top: 0.2rem; }

    .docente-subjects { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
    .subject-chip { font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 0.2rem 0.55rem; border-radius: 6px; }

    .btn-ver-perfil {
      align-self: flex-start;
      margin-top: 0.75rem;
      font-size: 0.82rem;
      font-weight: 800;
      color: #15803d;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .btn-ver-perfil svg { width: 14px; height: 14px; transition: transform 0.2s ease; }
    .docente-card:hover .btn-ver-perfil svg { transform: translateX(4px); }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .docente-modal {
      background: #ffffff;
      border-radius: 24px;
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      position: relative;
    }

    .modal-header-banner {
      background: linear-gradient(135deg, #15803d 0%, #14532d 100%);
      padding: 2.5rem 2.5rem 2rem;
      color: #ffffff;
      position: relative;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .btn-close-modal {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .modal-docente-photo { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff; flex-shrink: 0; }
    .modal-docente-title h3 { font-size: 1.4rem; font-weight: 900; color: #ffffff; margin-bottom: 0.25rem; }
    .modal-docente-title p { font-size: 0.9rem; color: #dcfce7; font-weight: 700; }

    .modal-body-content { padding: 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .modal-section-block h5 { font-size: 0.85rem; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; }
    .modal-section-block p { font-size: 0.95rem; color: #475569; line-height: 1.65; }

    .modal-titles-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .modal-titles-list li { font-size: 0.9rem; color: #334155; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
    .modal-titles-list li::before { content: '•'; color: #15803d; font-size: 1.2rem; }

    /* FOOTER */
    .landing-footer { background: linear-gradient(135deg, #15803d 0%, #14532d 100%); color: #ffffff; padding: 4.5rem 2rem 2.5rem; border-top: 1px solid #166534; }
    .footer-container { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3.5rem; margin-bottom: 3.5rem; }
    .footer-brand h4 { color: #ffffff; font-size: 1.3rem; font-weight: 900; margin-bottom: 0.85rem; }
    .footer-brand p { color: rgba(255, 255, 255, 0.85); font-size: 0.9rem; line-height: 1.65; max-width: 350px; }
    .footer-col h5 { color: #ffffff; font-size: 0.9rem; font-weight: 800; margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .footer-links a { color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; text-decoration: none; }
    .footer-links a:hover { color: #ffffff; text-decoration: underline; }

    .footer-bottom { max-width: 1240px; margin: 0 auto; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.15); display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; color: rgba(255, 255, 255, 0.75); }

    @media (max-width: 1024px) { .docentes-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .page-hero { padding: 8rem 1.5rem 4rem; } .page-hero h1 { font-size: 2.2rem; } .docentes-grid { grid-template-columns: 1fr; } .landing-header { padding: 0.75rem 1.25rem; } .nav-menu { display: none; } }
  `],
  template: `
    <!-- NAVBAR -->
    <header class="landing-header">
      <div class="header-container">
        <a routerLink="/" class="brand-group">
          <img src="assets/images/logo_unpa.png" alt="Logo Universidad del Pacífico" class="brand-logo-img" />
          <div class="brand-text">
            <span class="brand-title-small">Universidad del Pacífico</span>
            <span class="brand-sub-small">Ingeniería de Sistemas — PISUNPA</span>
          </div>
        </a>

        <nav>
          <ul class="nav-menu">
            <li><a routerLink="/landing">Inicio</a></li>
            <li><a routerLink="/programa">El Programa</a></li>
            <li><a routerLink="/landing" fragment="acerca">Acerca de</a></li>
            <li><a routerLink="/docentes" class="active">Docentes</a></li>
            <li><a routerLink="/investigacion">Investigación</a></li>
          </ul>
        </nav>

        <div class="nav-actions">
          <a routerLink="/login" class="btn-login-outline">Iniciar Sesión</a>
          <a routerLink="/registro" class="btn-register-solid">Registrarse</a>
        </div>
      </div>
    </header>

    <!-- HERO WITH UNSPLASH BACKGROUND IMAGE -->
    <section class="page-hero">
      <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80" alt="Docentes Universitarios" class="hero-bg-image" />
      <div class="hero-overlay"></div>

      <div class="page-hero-container">
        <h1>Nuestros Docentes y <span>Directivos</span></h1>
        <p>
          Conoce al equipo docente y administrativo del Programa de Ingeniería de Sistemas de la Universidad del Pacífico. Pulsa sobre cualquier perfil para ver la ficha académica completa.
        </p>
      </div>
    </section>

    <!-- BODY -->
    <main class="page-body">
      <!-- PARTE ADMINISTRATIVA -->
      <div class="docentes-sub-header">
        <h3>Administración del Programa</h3>
        <span class="docentes-badge-pill">Dirección & Secretaría</span>
      </div>

      <div class="docentes-grid">
        @for (doc of directivosPrograma; track doc.id) {
          <div class="docente-card" (click)="abrirModalDocente(doc)">
            <div>
              <div class="docente-card-header">
                <img [src]="doc.fotoUrl" [alt]="doc.nombre" class="docente-photo" />
                <div class="docente-meta">
                  <h5>{{ doc.nombre }}</h5>
                  <span class="docente-cargo">{{ doc.cargo }}</span>
                  <p class="docente-exp-tag">{{ doc.experienciaAnos }} años de experiencia</p>
                </div>
              </div>

              <div class="docente-subjects">
                @for (m of doc.materias; track m) {
                  <span class="subject-chip">{{ m }}</span>
                }
              </div>

              <p style="font-size: 0.88rem; color: #64748b; line-height: 1.55;">
                {{ doc.perfilMini }}
              </p>
            </div>

            <button class="btn-ver-perfil">
              Ver perfil y títulos
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        }
      </div>

      <!-- CUERPO DOCENTE DE PLANTA -->
      <div class="docentes-sub-header">
        <h3>Docentes de Ingeniería de Sistemas</h3>
        <span class="docentes-badge-pill">Planta Académica</span>
      </div>

      <div class="docentes-grid">
        @for (doc of docentesPlanta; track doc.id) {
          <div class="docente-card" (click)="abrirModalDocente(doc)">
            <div>
              <div class="docente-card-header">
                <img [src]="doc.fotoUrl" [alt]="doc.nombre" class="docente-photo" />
                <div class="docente-meta">
                  <h5>{{ doc.nombre }}</h5>
                  <span class="docente-cargo">{{ doc.cargo }}</span>
                  <p class="docente-exp-tag">{{ doc.experienciaAnos }} años de experiencia</p>
                </div>
              </div>

              <div class="docente-subjects">
                @for (m of doc.materias; track m) {
                  <span class="subject-chip">{{ m }}</span>
                }
              </div>

              <p style="font-size: 0.88rem; color: #64748b; line-height: 1.55;">
                {{ doc.perfilMini }}
              </p>
            </div>

            <button class="btn-ver-perfil">
              Ver perfil y títulos
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        }
      </div>
    </main>

    <!-- MODAL DOCENTE -->
    @if (docenteSeleccionado) {
      <div class="modal-backdrop" (click)="cerrarModalDocente()">
        <div class="docente-modal" (click)="$event.stopPropagation()">
          <div class="modal-header-banner">
            <button class="btn-close-modal" (click)="cerrarModalDocente()">✕</button>
            <img [src]="docenteSeleccionado.fotoUrl" [alt]="docenteSeleccionado.nombre" class="modal-docente-photo" />
            <div class="modal-docente-title">
              <h3>{{ docenteSeleccionado.nombre }}</h3>
              <p>{{ docenteSeleccionado.cargo }} — {{ docenteSeleccionado.experienciaAnos }} Años de Trayectoria</p>
            </div>
          </div>

          <div class="modal-body-content">
            <div class="modal-section-block">
              <h5>Perfil Académico & Profesional</h5>
              <p>{{ docenteSeleccionado.perfilCompleto }}</p>
            </div>

            <div class="modal-section-block">
              <h5>Títulos y Grados Académicos</h5>
              <ul class="modal-titles-list">
                @for (t of docenteSeleccionado.titulos; track t) {
                  <li>{{ t }}</li>
                }
              </ul>
            </div>

            <div class="modal-section-block">
              <h5>Asignaturas Impartidas</h5>
              <div class="docente-subjects">
                @for (m of docenteSeleccionado.materias; track m) {
                  <span class="subject-chip" style="font-size: 0.8rem; padding: 0.3rem 0.75rem;">{{ m }}</span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- FOOTER -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <h4>Universidad del Pacífico</h4>
          <p>
            Programa de Ingeniería de Sistemas — PISUNPA.<br>
            Buenaventura, Valle del Cauca, Colombia.
          </p>
        </div>

        <div class="footer-col">
          <h5>Navegación</h5>
          <ul class="footer-links">
            <li><a routerLink="/landing">Inicio</a></li>
            <li><a routerLink="/programa">El Programa</a></li>
            <li><a routerLink="/docentes">Docentes</a></li>
            <li><a routerLink="/investigacion">Investigación</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h5>Acceso</h5>
          <ul class="footer-links">
            <li><a routerLink="/login">Iniciar Sesión</a></li>
            <li><a routerLink="/registro">Registrarse</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h5>Contacto</h5>
          <ul class="footer-links">
            <li><a href="https://www.unipacifico.edu.co/" target="_blank" rel="noopener">Portal Web UNPA</a></li>
            <li><a href="https://www.unipacifico.edu.co/p/9/comunicaciones/ingenieria-de-sistemas" target="_blank" rel="noopener">Ingeniería de Sistemas</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 Universidad del Pacífico — Programa de Ingeniería de Sistemas. Todos los derechos reservados.</span>
        <span>PISUNPA — Buenaventura</span>
      </div>
    </footer>
  `
})
export class DocentesComponent {
  docenteSeleccionado: DocentePerfil | null = null;

  readonly directivosPrograma: DocentePerfil[] = [
    {
      id: 1,
      nombre: 'Dr. Carlos A. Rentería',
      cargo: 'Director del Programa',
      categoria: 'Administrativo',
      titulos: [
        'Doctor en Ciencias de la Computación — Universidad Nacional de Colombia',
        'Magíster en Ingeniería de Software y Sistemas',
        'Ingeniero de Sistemas — Universidad del Pacífico'
      ],
      experienciaAnos: 18,
      materias: ['Dirección Académica', 'Arquitectura de Software', 'Seminario de Investigación'],
      perfilMini: 'Líder en gestión de calidad académica, acreditación institucional y desarrollo estratégico del programa.',
      perfilCompleto: 'Investigador sénior con más de 18 años de experiencia en la docencia universitaria y la administración educativa. Ha liderado procesos de acreditación de alta calidad y publicaciones internacionales en sistemas distribuidos y educación tecnológica territorial.',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 2,
      nombre: 'Ing. Sandra M. Mosquera',
      cargo: 'Secretaria Académica',
      categoria: 'Administrativo',
      titulos: [
        'Especialista en Gestión Educativa y Evaluación Universitaria',
        'Ingeniera de Sistemas — Universidad del Pacífico'
      ],
      experienciaAnos: 12,
      materias: ['Gestión Académica', 'Reglamentación Estudiantil', 'Sistemas de Información'],
      perfilMini: 'Atención y validación formal de solicitudes estudiantiles, seguimiento a notas y registro supletorio.',
      perfilCompleto: 'Especialista en administración académica con 12 años de trayectoria continuada en la Universidad del Pacífico. Encargada de la supervisión formal de calendarios académicos, admisiones y procesos supletorios institucionales.',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
    }
  ];

  readonly docentesPlanta: DocentePerfil[] = [
    {
      id: 3,
      nombre: 'MSc. Jorge E. Valencia',
      cargo: 'Docente / Coord. Supletorios',
      categoria: 'Docente',
      titulos: [
        'Magíster en Gestión de Tecnologías de la Información',
        'Ingeniero de Sistemas — Universidad del Pacífico'
      ],
      experienciaAnos: 14,
      materias: ['Gestión de Proyectos TI', 'Ingeniería de Requerimientos', 'Evaluación Académica'],
      perfilMini: 'Gestión y trazabilidad administrativa del proceso digital de evaluaciones supletorias.',
      perfilCompleto: 'Docente e investigador en gestión tecnológica y formulación de proyectos informáticos. Coordina el módulo institucional de supletorios para la articulación entre estudiantes, secretaría y profesores.',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 4,
      nombre: 'Dr. Hernán F. Mina',
      cargo: 'Docente Investigador',
      categoria: 'Docente',
      titulos: [
        'Doctor en Inteligencia Artificial — Universidad Politécnica de Madrid',
        'Magíster en Ciencias de la Computación',
        'Ingeniero de Sistemas'
      ],
      experienciaAnos: 16,
      materias: ['Inteligencia Artificial', 'Aprendizaje Automático', 'Estructuras de Datos'],
      perfilMini: 'Especialista en inteligencia artificial, analítica de datos y computación de alto rendimiento.',
      perfilCompleto: 'Experto en desarrollo de modelos predictivos y algoritmos de visión por computador. Lidera proyectos de analítica de datos aplicados al contexto del Pacífico colombiano.',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 5,
      nombre: 'MSc. Andrés F. Caicedo',
      cargo: 'Docente de Software',
      categoria: 'Docente',
      titulos: [
        'Magíster en Desarrollo e Innovación de Software',
        'Ingeniero de Sistemas'
      ],
      experienciaAnos: 10,
      materias: ['Programación Web Avanzada', 'Arquitectura de Software', 'Patrones de Diseño'],
      perfilMini: 'Orientación en diseño de sistemas distribuidos, microservicios y desarrollo web moderno.',
      perfilCompleto: 'Desarrollador e investigador en arquitecturas cloud native y microservicios. Docente de materias de programación orientada a objetos y frameworks modernos en Angular y Django.',
      fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 6,
      nombre: 'Ing. Beatriz E. Córdoba',
      cargo: 'Docente de Redes & Seguridad',
      categoria: 'Docente',
      titulos: [
        'Especialista en Ciberseguridad y Redes de Computadores',
        'Ingeniera de Sistemas'
      ],
      experienciaAnos: 11,
      materias: ['Redes de Computadores', 'Seguridad de la Información', 'Sistemas Operativos'],
      perfilMini: 'Investigadora en ciberseguridad, redes de datos e infraestructura tecnológica.',
      perfilCompleto: 'Consultora en seguridad informática y administración de infraestructura de red. Docente encargada del laboratorio de redes y auditoría de sistemas.',
      fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 7,
      nombre: 'MSc. Mateo A. Quiñones',
      cargo: 'Docente de Proyectos de Grado',
      categoria: 'Docente',
      titulos: [
        'Magíster en Metodología de la Investigación Tecnológica',
        'Ingeniero de Sistemas'
      ],
      experienciaAnos: 9,
      materias: ['Metodología de la Investigación', 'Proyecto de Grado I', 'Proyecto de Grado II'],
      perfilMini: 'Acompañamiento y tutoría en metodologías de investigación e innovación tecnológica.',
      perfilCompleto: 'Tutor de trabajos de grado con énfasis en desarrollo de soluciones tecnológicas aplicadas al territorio del Pacífico.',
      fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 8,
      nombre: 'Ing. Yulieth P. Rivas',
      cargo: 'Docente Gestora Académica',
      categoria: 'Docente',
      titulos: [
        'Especialista en Gerencia de Proyectos de Telecomunicaciones',
        'Ingeniera de Sistemas'
      ],
      experienciaAnos: 8,
      materias: ['Bases de Datos I', 'Bases de Datos II', 'Sistemas de Información'],
      perfilMini: 'Docente experta en modelado de datos relacionales y gestión de eventos tecnológicos.',
      perfilCompleto: 'Docente investigadora orientada a la ingeniería de datos y la organización de simposios académicos y eventos de divulgación científica.',
      fotoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80'
    }
  ];

  abrirModalDocente(doc: DocentePerfil): void {
    this.docenteSeleccionado = doc;
  }

  cerrarModalDocente(): void {
    this.docenteSeleccionado = null;
  }
}
