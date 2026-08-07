import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface IntegranteEquipo {
  nombre: string;
  cargo: string;
  area: string;
  descripcion: string;
  fotoUrl: string;
  esLider?: boolean;
}

@Component({
  selector: 'app-landing',
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
      transition: all 0.3s ease;
    }

    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
    }

    .brand-logo-img {
      height: 48px;
      width: auto;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title-small {
      color: #0f172a;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      line-height: 1.15;
    }

    .brand-sub-small {
      color: #15803d;
      font-size: 0.74rem;
      font-weight: 700;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.8rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-menu a {
      color: #475569;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      transition: color 0.2s ease;
      cursor: pointer;
    }

    .nav-menu a:hover {
      color: #15803d;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .btn-login-outline {
      padding: 0.55rem 1.35rem;
      border: 2px solid #15803d;
      border-radius: 8px;
      color: #15803d;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.25s ease;
      background: transparent;
    }

    .btn-login-outline:hover {
      background: #15803d;
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-register-solid {
      padding: 0.6rem 1.35rem;
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      color: #ffffff;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(21, 128, 61, 0.4);
      transition: all 0.25s ease;
    }

    .btn-register-solid:hover {
      background: linear-gradient(135deg, #166534 0%, #14532d 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(21, 128, 61, 0.55);
    }

    /* ===== HERO SECTION ===== */
    .hero-section {
      position: relative;
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 8.5rem 4rem 5rem;
      background: #0f172a;
      box-sizing: border-box;
      overflow: hidden;
    }

    .hero-bg-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 1;
      display: block;
    }

    .hero-container {
      position: relative;
      z-index: 10;
      max-width: 600px;
      margin: 0;
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .hero-title {
      font-size: 3.4rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.035em;
      line-height: 1.1;
      margin-bottom: 1.25rem;
      max-width: 580px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      text-align: left;
    }

    .hero-title span {
      color: #4ade80;
    }

    .hero-slogan-text {
      font-size: 1.02rem;
      font-style: italic;
      color: #4ade80;
      font-weight: 600;
      max-width: 550px;
      margin: 0;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
      line-height: 1.5;
      text-align: left;
    }

    /* ===== EDITORIAL SECTIONS ===== */
    .editorial-section {
      padding: 6rem 2rem;
      max-width: 1240px;
      margin: 0 auto;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 5rem 0;
    }

    .feature-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      margin-bottom: 5rem;
    }

    .feature-row.reverse {
      direction: rtl;
    }

    .feature-row.reverse .feature-content {
      direction: ltr;
    }

    .feature-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .feature-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .feature-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .feature-description {
      font-size: 1.05rem;
      color: #475569;
      line-height: 1.65;
    }

    /* ABOUT CARDS GRID */
    .about-cards-grid {
      grid-column: span 2;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-top: 1rem;
    }

    .about-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
      transition: all 0.25s ease;
    }

    .about-card:hover {
      border-color: #15803d;
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(21, 128, 61, 0.08);
    }

    .about-card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #f0fdf4;
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .about-card-icon svg {
      width: 22px;
      height: 22px;
    }

    .about-card h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.6rem;
    }

    .about-card p {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }

    /* ===== INDIVIDUAL 9 MEMBERS TEAM GRID ===== */
    .individual-team-container {
      grid-column: span 2;
      margin-top: 3.5rem;
    }

    .individual-team-header {
      margin-bottom: 2.25rem;
    }

    .individual-team-header h3 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-top: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .individual-team-header p {
      font-size: 0.95rem;
      color: #64748b;
    }

    .team-grid-9 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
    }

    .person-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      position: relative;
    }

    .person-card:hover {
      border-color: #15803d;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    .person-card.leader {
      grid-column: span 3;
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      border: 1.5px solid #bbf7d0;
      padding: 1.75rem 2rem;
    }

    .person-card.leader:hover {
      border-color: #15803d;
    }

    .person-photo-img {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      border: 2px solid #ffffff;
    }

    .person-card.leader .person-photo-img {
      width: 80px;
      height: 80px;
      border: 3px solid #15803d;
    }

    .person-header-group {
      display: flex;
      align-items: center;
      gap: 1.1rem;
      margin-bottom: 1.1rem;
    }

    .person-info h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.15rem;
    }

    .person-role {
      font-size: 0.8rem;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .person-desc {
      font-size: 0.88rem;
      color: #475569;
      line-height: 1.55;
      margin-bottom: 1.25rem;
    }

    .person-badge {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      padding: 0.3rem 0.75rem;
      background: #f1f5f9;
      color: #334155;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 20px;
    }

    .person-card.leader .person-badge {
      background: #15803d;
      color: #ffffff;
    }

    .feature-highlights {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .highlight-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }

    .highlight-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: #dcfce7;
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .highlight-icon svg {
      width: 14px;
      height: 14px;
    }

    .highlight-text {
      font-size: 0.95rem;
      color: #334155;
      font-weight: 600;
      line-height: 1.4;
    }

    /* Showcase Visual Panel */
    .showcase-panel {
      background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%);
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
      position: relative;
      overflow: hidden;
    }

    .showcase-panel-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .showcase-badge-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #15803d;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .showcase-badge-icon svg {
      width: 22px;
      height: 22px;
    }

    .showcase-panel-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }

    .step-flow {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .step-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.15rem 1.35rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #15803d;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-info h5 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.15rem;
    }

    .step-info p {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0;
    }

    /* ===== FOOTER (VERDE INSTITUCIONAL ELEGANTE) ===== */
    .landing-footer {
      background: linear-gradient(135deg, #15803d 0%, #14532d 100%);
      color: #ffffff;
      padding: 4.5rem 2rem 2.5rem;
      border-top: 1px solid #166534;
    }

    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3.5rem;
      margin-bottom: 3.5rem;
    }

    .footer-brand h4 {
      color: #ffffff;
      font-size: 1.3rem;
      font-weight: 900;
      margin-bottom: 0.85rem;
      letter-spacing: -0.01em;
    }

    .footer-brand p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.9rem;
      line-height: 1.65;
      max-width: 350px;
    }

    .footer-col h5 {
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 800;
      margin-bottom: 1.25rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-links a, .footer-links button {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      text-decoration: none;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: color 0.2s ease;
    }

    .footer-links a:hover, .footer-links button:hover {
      color: #ffffff;
      text-decoration: underline;
    }

    .footer-bottom {
      max-width: 1240px;
      margin: 0 auto;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.75);
    }

    /* RESPONSIVE */
    @media (max-width: 1024px) {
      .hero-title { font-size: 2.8rem; }
      .feature-row { grid-template-columns: 1fr; gap: 2.5rem; }
      .feature-row.reverse { direction: ltr; }
      .about-cards-grid, .team-grid-9 { grid-template-columns: 1fr 1fr; }
      .person-card.leader { grid-column: span 2; }
      .footer-container { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 640px) {
      .landing-header { padding: 0.75rem 1.25rem; }
      .nav-menu { display: none; }
      .hero-title { font-size: 2.2rem; }
      .about-cards-grid, .team-grid-9 { grid-template-columns: 1fr; }
      .person-card.leader { grid-column: span 1; }
      .footer-container { grid-template-columns: 1fr; }
    }
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
            <li><a (click)="scrollToSection('inicio', $event)">Inicio</a></li>
            <li><a routerLink="/programa">El Programa</a></li>
            <li><a (click)="scrollToSection('acerca', $event)">Acerca de</a></li>
            <li><a routerLink="/docentes">Docentes</a></li>
            <li><a routerLink="/investigacion">Investigación</a></li>
          </ul>
        </nav>

        <div class="nav-actions">
          <a routerLink="/login" class="btn-login-outline">Iniciar Sesión</a>
          <a routerLink="/registro" class="btn-register-solid">Registrarse</a>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section id="inicio" class="hero-section">
      <img src="assets/images/fondo_landing.png" alt="Fondo Universidad del Pacífico" class="hero-bg-image" />

      <div class="hero-container">
        <h1 class="hero-title">
          Sistema de Gestión de <span>Egresados</span>
        </h1>

        <p class="hero-slogan-text">
          "Innovar no es una opción, es nuestro próximo paso. ¡Construyamos juntos el futuro!"
        </p>
      </div>
    </section>

    <!-- BESPOKE EDITORIAL SECTIONS -->
    <main class="editorial-section">
      <!-- SECTION: ACERCA DE -->
      <section id="acerca" class="feature-row" style="margin-bottom: 4rem;">
        <div class="feature-content" style="grid-column: span 2;">
          <span class="feature-tag">Programa Académico</span>
          <h2 class="feature-title">Acerca de la Plataforma PISUNPA</h2>
          <p class="feature-description">
            Plataforma web del Programa de Ingeniería de Sistemas desarrollada para gestionar las solicitudes de exámenes supletorios y el registro de egresados de la Universidad del Pacífico.
          </p>
        </div>

        <div class="about-cards-grid">
          <div class="about-card">
            <div class="about-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h4>Solicitud de Supletorios</h4>
            <p>Radicación de supletorios por los estudiantes con soporte de pago, revisión de secretaría y calificación docente.</p>
          </div>

          <div class="about-card">
            <div class="about-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <h4>Registro de Egresados</h4>
            <p>Registro y actualización de información personal y profesional para los graduados de Ingeniería de Sistemas.</p>
          </div>

          <div class="about-card">
            <div class="about-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h4>Gestión Docente y Secretaría</h4>
            <p>Aprobación administrativa de solicitudes y registro de calificaciones definitivas en el sistema.</p>
          </div>
        </div>

        <!-- 9 PERFILES INDIVIDUALES DEL EQUIPO DESARROLLADOR -->
        <div class="individual-team-container">
          <div class="individual-team-header">
            <span class="feature-tag">Equipo Desarrollador</span>
            <h3>Integrantes del Proyecto PISUNPA</h3>
            <p>Docente asesor y los 8 estudiantes desarrolladores responsables de la creación de la plataforma.</p>
          </div>

          <div class="team-grid-9">
            <!-- 1. DOCENTE ASESOR (LÍDER DESTACADO) -->
            <div class="person-card leader">
              <div>
                <div class="person-header-group">
                  <img [src]="docenteLider.fotoUrl" [alt]="docenteLider.nombre" class="person-photo-img" />
                  <div class="person-info">
                    <h4>{{ docenteLider.nombre }}</h4>
                    <span class="person-role">{{ docenteLider.cargo }}</span>
                  </div>
                </div>

                <p class="person-desc">
                  {{ docenteLider.descripcion }}
                </p>
              </div>

              <span class="person-badge">{{ docenteLider.area }}</span>
            </div>

            <!-- 8 ESTUDIANTES DESARROLLADORES INDIVIDUALES -->
            @for (estudiante of estudiantesIntegrantes; track estudiante.nombre) {
              <div class="person-card">
                <div>
                  <div class="person-header-group">
                    <img [src]="estudiante.fotoUrl" [alt]="estudiante.nombre" class="person-photo-img" />
                    <div class="person-info">
                      <h4>{{ estudiante.nombre }}</h4>
                      <span class="person-role">{{ estudiante.cargo }}</span>
                    </div>
                  </div>

                  <p class="person-desc">
                    {{ estudiante.descripcion }}
                  </p>
                </div>

                <span class="person-badge">
                  {{ estudiante.area }}
                </span>
              </div>
            }
          </div>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- ROW 1: SUPLETORIOS -->
      <section id="supletorios" class="feature-row">
        <div class="feature-content">
          <span class="feature-tag">Módulo Académico</span>
          <h2 class="feature-title">Gestión Digital de Exámenes Supletorios</h2>
          <p class="feature-description">
            Un flujo estructurado e integrado que permite a los estudiantes radicar solicitudes, verificar el estado de pago, obtener aprobación de Secretaría Académica y permitir la calificación por parte de los docentes.
          </p>

          <div class="feature-highlights">
            <div class="highlight-item">
              <div class="highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="highlight-text">Radicación en línea con selección de asignatura y docente responsable</span>
            </div>

            <div class="highlight-item">
              <div class="highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="highlight-text">Verificación y aprobación transparente por Secretaría y Dirección</span>
            </div>

            <div class="highlight-item">
              <div class="highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="highlight-text">Bandeja docente para asignación y registro de notas definitivas</span>
            </div>
          </div>
        </div>

        <div class="showcase-panel">
          <div class="showcase-panel-header">
            <div class="showcase-badge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3 class="showcase-panel-title">Flujo del Supletorio</h3>
          </div>

          <div class="step-flow">
            <div class="step-box">
              <div class="step-num">1</div>
              <div class="step-info">
                <h5>Radicación Estudiantil</h5>
                <p>Ingreso de asignatura, fecha y comprobante de pago.</p>
              </div>
            </div>

            <div class="step-box">
              <div class="step-num">2</div>
              <div class="step-info">
                <h5>Aprobación Administrativa</h5>
                <p>Revisión por Secretaría y asignación al profesor.</p>
              </div>
            </div>

            <div class="step-box">
              <div class="step-num">3</div>
              <div class="step-info">
                <h5>Evaluación y Nota</h5>
                <p>Aplicación de prueba y registro directo de calificación.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- ROW 2: EGRESADOS (REVERSE LAYOUT) -->
      <section id="egresados" class="feature-row reverse">
        <div class="feature-content">
          <span class="feature-tag">Red Institucional</span>
          <h2 class="feature-title">Portal y Seguimiento a Egresados</h2>
          <p class="feature-description">
            Espacio dedicado a mantener el vínculo entre los graduados de Ingeniería de Sistemas y la Universidad del Pacífico, facilitando la actualización de perfiles profesionales, eventos y analítica institucional.
          </p>

          <div class="feature-highlights">
            <div class="highlight-item">
              <div class="highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="highlight-text">Registro de perfil profesional e historia ocupacional</span>
            </div>

            <div class="highlight-item">
              <div class="highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="highlight-text">Convocatorias y notificaciones de eventos académicos</span>
            </div>

            <div class="highlight-item">
              <div class="highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="highlight-text">Tableros de control y analítica para la Coordinación de Egresados</span>
            </div>
          </div>
        </div>

        <div class="showcase-panel">
          <div class="showcase-panel-header">
            <div class="showcase-badge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 class="showcase-panel-title">Comunidad Egresada</h3>
          </div>

          <div class="step-flow">
            <div class="step-box">
              <div class="step-num">A</div>
              <div class="step-info">
                <h5>Perfil de Graduado</h5>
                <p>Información laboral actualizada y contacto continuo.</p>
              </div>
            </div>

            <div class="step-box">
              <div class="step-num">B</div>
              <div class="step-info">
                <h5>Eventos y Talleres</h5>
                <p>Notificaciones a correo e inscripción activa.</p>
              </div>
            </div>

            <div class="step-box">
              <div class="step-num">C</div>
              <div class="step-info">
                <h5>Informes e Impacto</h5>
                <p>Distribución geográfica y consolidado institucional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER (VERDE INSTITUCIONAL ELEGANTE) -->
    <footer id="contacto" class="landing-footer">
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
            <li><button (click)="scrollToSection('inicio', $event)">Inicio</button></li>
            <li><a routerLink="/programa">El Programa</a></li>
            <li><button (click)="scrollToSection('acerca', $event)">Acerca de</button></li>
            <li><a routerLink="/docentes">Docentes</a></li>
            <li><a routerLink="/investigacion">Investigación</a></li>
            <li><button (click)="scrollToSection('supletorios', $event)">Supletorios</button></li>
            <li><button (click)="scrollToSection('egresados', $event)">Egresados</button></li>
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
export class LandingComponent {
  readonly docenteLider: IntegranteEquipo = {
    nombre: 'MSc. Carlos Alberto Mina',
    cargo: 'Líder & Docente Asesor',
    area: 'Magíster en Ingeniería',
    descripcion: 'Supervisión metodológica, dirección de arquitectura y tutoría del equipo de desarrollo PISUNPA.',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    esLider: true
  };

  readonly estudiantesIntegrantes: IntegranteEquipo[] = [
    {
      nombre: 'Juan Pablo Valencia',
      cargo: 'Desarrollador Frontend UI/UX',
      area: 'Frontend',
      descripcion: 'Diseño visual de interfaz de usuario, maquetación adaptativa y experiencia de usuario.',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
    },
    {
      nombre: 'Camilo Andrés Córdoba',
      cargo: 'Desarrollador Frontend Angular',
      area: 'Frontend',
      descripcion: 'Desarrollo de componentes web, navegación de vistas e integración reactiva.',
      fotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80'
    },
    {
      nombre: 'JUAN ROMAN CUERO ORDOÑEZ',
      cargo: 'Desarrollador Backend Lead',
      area: 'Backend',
      descripcion: 'Diseño de la arquitectura de la API REST, controladores y lógica principal.',
      fotoUrl: 'assets/images/desarrolladores/JUAN.jpeg'
    },
    {
      nombre: 'Santiago Mosquera',
      cargo: 'Desarrollador Backend Servicios',
      area: 'Backend',
      descripcion: 'Servicios para módulos de supletorios y egresados y validaciones del negocio.',
      fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'
    },
    {
      nombre: 'Mateo Alejandro Quiñones',
      cargo: 'Desarrollador Backend Seguridad',
      area: 'Backend',
      descripcion: 'Autenticación de usuarios, gestión de permisos JWT y seguridad de datos.',
      fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80'
    },
    {
      nombre: 'Diego Fernando Rivas',
      cargo: 'Administrador Base de Datos',
      area: 'Base de Datos',
      descripcion: 'Diseño del modelo relacional E-R, creación de tablas y gestión de persistencia.',
      fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
    },
    {
      nombre: 'Hernán Rentería',
      cargo: 'Especialista Base de Datos & SQL',
      area: 'Base de Datos',
      descripcion: 'Consultas optimizadas, integridad de datos y soporte en la capa de datos.',
      fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
    },
    {
      nombre: 'Julián Esteban Angulo',
      cargo: 'Analista QA & Documentación',
      area: 'Documentación & QA',
      descripcion: 'Pruebas de calidad, especificación de requerimientos y documentación del sistema.',
      fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
    }
  ];

  scrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
