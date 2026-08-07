import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SublineaInvestigacion {
  nombre: string;
  descripcion: string;
}

interface LineaInvestigacion {
  titulo: string;
  descripcion: string;
  sublineas: SublineaInvestigacion[];
}

interface IntegranteSemillero {
  nombre: string;
  rol: string;
  semestre: string;
  fotoUrl: string;
}

interface SemilleroInvestigacion {
  nombre: string;
  sigla: string;
  descripcion: string;
  proyectoActual: { titulo: string; descripcion: string };
  proyectosTerminados: { titulo: string; descripcion: string }[];
  integrantes: IntegranteSemillero[];
}

@Component({
  selector: 'app-investigacion',
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

    /* ===== HERO PHOTO BACKGROUND ===== */
    .page-hero {
      position: relative;
      min-height: 50vh;
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
      background: linear-gradient(90deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.45) 55%, rgba(15, 23, 42, 0.15) 100%);
    }

    .page-hero-container {
      position: relative;
      z-index: 10;
      max-width: 720px;
      margin: 0;
      text-align: left;
    }

    .page-hero h1 {
      font-size: 3.4rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.035em;
      line-height: 1.1;
      margin-bottom: 1rem;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    }

    .page-hero h1 span {
      color: #4ade80;
    }

    .page-hero p {
      font-size: 1.15rem;
      color: #f1f5f9;
      line-height: 1.6;
      font-weight: 500;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
    }

    /* ===== PAGE BODY & SECTIONS ===== */
    .page-body {
      padding: 4rem 2rem 6rem;
      max-width: 1240px;
      margin: 0 auto;
    }

    .section-header {
      margin-bottom: 2.25rem;
    }

    .section-tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }

    .section-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .section-subtitle {
      font-size: 1rem;
      color: #64748b;
      line-height: 1.6;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 4.5rem 0;
    }

    /* BARRA METRICAS INVESTIGACION */
    .inv-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 4.5rem;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      transition: all 0.25s ease;
    }

    .metric-card:hover {
      border-color: #15803d;
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(21, 128, 61, 0.08);
    }

    .metric-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #f0fdf4;
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .metric-icon svg { width: 22px; height: 22px; }

    .metric-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }

    .metric-desc {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.55;
      margin: 0;
    }

    /* GRUPO DE INVESTIGACIÓN IES */
    .grupo-ies-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%);
      border: 1.5px solid #bbf7d0;
      border-radius: 24px;
      padding: 3.5rem;
      margin-bottom: 4.5rem;
      box-shadow: 0 10px 30px rgba(21, 128, 61, 0.05);
      position: relative;
    }

    .grupo-ies-header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .grupo-ies-badge {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(21, 128, 61, 0.35);
      flex-shrink: 0;
    }

    .grupo-ies-badge svg { width: 28px; height: 28px; }

    .grupo-ies-title h3 {
      font-size: 1.8rem;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .grupo-ies-title p {
      font-size: 0.88rem;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 0.15rem;
    }

    .grupo-ies-text {
      font-size: 1.05rem;
      color: #334155;
      line-height: 1.75;
      margin: 0;
    }

    /* LÍNEAS Y SUBLÍNEAS DE INVESTIGACIÓN */
    .lineas-container {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      margin-bottom: 4.5rem;
    }

    .linea-section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 22px;
      padding: 2.75rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      transition: all 0.3s ease;
    }

    .linea-section-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
    }

    .linea-header {
      margin-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }

    .linea-header h4 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .linea-header p {
      font-size: 1rem;
      color: #475569;
      line-height: 1.65;
      margin: 0;
    }

    .sublineas-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .sublinea-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.25s ease;
    }

    .sublinea-card:hover {
      background: #ffffff;
      border-color: #15803d;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(21, 128, 61, 0.08);
    }

    .sublinea-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sublinea-card h5 {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
    }

    .sublinea-card p {
      font-size: 0.86rem;
      color: #64748b;
      line-height: 1.55;
      margin: 0;
    }

    /* SEMILLEROS DE INVESTIGACIÓN */
    .semilleros-list {
      display: flex;
      flex-direction: column;
      gap: 3.5rem;
    }

    .semillero-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.03);
    }

    .semillero-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .semillero-title-group h4 {
      font-size: 1.6rem;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .semillero-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.95rem;
      background: #dcfce7;
      color: #15803d;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .semillero-status-pill::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #15803d;
    }

    .semillero-description {
      font-size: 1.02rem;
      color: #475569;
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    /* PROYECTOS DEL SEMILLERO */
    .proyectos-wrapper {
      margin-bottom: 2.5rem;
    }

    .proyectos-subtitle {
      font-size: 0.85rem;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 1rem;
    }

    .proyectos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
    }

    .proyecto-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .proyecto-box.en-ejecucion {
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      border: 1.5px solid #bbf7d0;
    }

    .proyecto-tag {
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    .proyecto-box.en-ejecucion .proyecto-tag {
      color: #15803d;
    }

    .proyecto-box h5 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.4;
    }

    .proyecto-box p {
      font-size: 0.88rem;
      color: #475569;
      line-height: 1.6;
      margin: 0;
    }

    /* INTEGRANTES ESTUDIANTILES EN 5 COLUMNAS ELEGANTES */
    .integrantes-wrapper {
      border-top: 1px solid #f1f5f9;
      padding-top: 2rem;
    }

    .integrantes-subtitle {
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 1.25rem;
    }

    .integrantes-grid-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
    }

    .member-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.25s ease;
    }

    .member-card:hover {
      border-color: #15803d;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
    }

    .member-photo {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #15803d;
      margin-bottom: 0.75rem;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    }

    .member-name {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.15rem;
      line-height: 1.25;
    }

    .member-role {
      font-size: 0.75rem;
      font-weight: 700;
      color: #15803d;
      margin-bottom: 0.15rem;
    }

    .member-semestre {
      font-size: 0.72rem;
      color: #64748b;
    }

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

    @media (max-width: 1024px) {
      .inv-metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .sublineas-grid { grid-template-columns: 1fr; }
      .proyectos-grid { grid-template-columns: 1fr; }
      .integrantes-grid-5 { grid-template-columns: repeat(3, 1fr); }
      .footer-container { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 640px) {
      .landing-header { padding: 0.75rem 1.25rem; }
      .nav-menu { display: none; }
      .page-hero { padding: 8rem 1.5rem 4rem; }
      .page-hero h1 { font-size: 2.2rem; }
      .inv-metrics-grid { grid-template-columns: 1fr; }
      .integrantes-grid-5 { grid-template-columns: repeat(2, 1fr); }
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
            <li><a routerLink="/landing">Inicio</a></li>
            <li><a routerLink="/programa">El Programa</a></li>
            <li><a routerLink="/landing" fragment="acerca">Acerca de</a></li>
            <li><a routerLink="/docentes">Docentes</a></li>
            <li><a routerLink="/investigacion" class="active">Investigación</a></li>
          </ul>
        </nav>

        <div class="nav-actions">
          <a routerLink="/login" class="btn-login-outline">Iniciar Sesión</a>
          <a routerLink="/registro" class="btn-register-solid">Registrarse</a>
        </div>
      </div>
    </header>

    <!-- HERO PHOTO BACKGROUND -->
    <section class="page-hero">
      <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80" alt="Laboratorio de Investigación en Sistemas" class="hero-bg-image" />
      <div class="hero-overlay"></div>

      <div class="page-hero-container">
        <h1>Investigación e <span>Innovación Tecnológica</span></h1>
        <p>
          Universidad del Pacífico — Desarrollo de conocimiento científico, líneas de investigación, Grupo IES y semilleros formativos.
        </p>
      </div>
    </section>

    <!-- CUERPO PRINCIPAL ESTRUCTURADO -->
    <main class="page-body">
      <!-- BARRA SUPERIOR DE RESUMEN DEL ECOSISTEMA DE INVESTIGACIÓN -->
      <div class="inv-metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="metric-title">Grupo IES</span>
          <p class="metric-desc">Grupo de Investigación registrado en Ingeniería, Energía y Sistemas.</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span class="metric-title">2 Líneas Institucionales</span>
          <p class="metric-desc">Ciencia, Tecnología e Innovación y su relación con la Sociedad.</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span class="metric-title">2 Semilleros Activos</span>
          <p class="metric-desc">SIC (Inteligencia Computacional) y SDWS (Desarrollo Web & Sistemas).</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span class="metric-title">Impacto Territorial</span>
          <p class="metric-desc">Soluciones aplicadas a problemáticas reales del Pacífico colombiano.</p>
        </div>
      </div>

      <!-- SECCIÓN: GRUPO DE INVESTIGACIÓN IES -->
      <section class="grupo-ies-card">
        <div class="grupo-ies-header">
          <div class="grupo-ies-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="grupo-ies-title">
            <h3>Grupo IES (Ingeniería, Energía y Sistemas)</h3>
            <p>Grupo de Investigación Institucional Registrado</p>
          </div>
        </div>

        <p class="grupo-ies-text">
          El Grupo de Investigación IES nace de la necesidad imperativa de generar desarrollo tecnológico autónomo en el Pacífico colombiano. Su propósito fundamental es estructurar proyectos de investigación aplicada que resuelvan problemáticas locales en energía, sistemas distribuidos, inteligencia computacional y optimización de datos para el aparato productivo e institucional de la región.
        </p>
      </section>

      <!-- SECCIÓN: LÍNEAS Y SUBLÍNEAS DE INVESTIGACIÓN -->
      <section class="section-header">
        <span class="section-tag-pill">Ejes Temáticos</span>
        <h2 class="section-title">Líneas de Investigación del Programa</h2>
        <p class="section-subtitle">
          Estructura de investigación que orienta los trabajos de grado y proyectos formativos de los estudiantes.
        </p>
      </section>

      <div class="lineas-container">
        @for (linea of lineasInvestigacion; track linea.titulo) {
          <div class="linea-section-card">
            <div class="linea-header">
              <h4>{{ linea.titulo }}</h4>
              <p>{{ linea.descripcion }}</p>
            </div>

            <div class="sublineas-grid">
              @for (sub of linea.sublineas; track sub.nombre) {
                <div class="sublinea-card">
                  <span class="sublinea-badge">Sublínea de Investigación</span>
                  <h5>{{ sub.nombre }}</h5>
                  <p>{{ sub.descripcion }}</p>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <div class="section-divider"></div>

      <!-- SECCIÓN: SEMILLEROS DE INVESTIGACIÓN -->
      <section class="section-header">
        <span class="section-tag-pill">Formación Investigativa</span>
        <h2 class="section-title">Semilleros de Investigación Estudiantil</h2>
        <p class="section-subtitle">
          Espacios de aprendizaje práctico donde estudiantes y docentes desarrollan proyectos informáticos innovadores.
        </p>
      </section>

      <div class="semilleros-list">
        @for (semillero of semillerosInvestigacion; track semillero.sigla) {
          <div class="semillero-card">
            <div class="semillero-top-bar">
              <div class="semillero-title-group">
                <h4>{{ semillero.nombre }} ({{ semillero.sigla }})</h4>
              </div>
              <span class="semillero-status-pill">Semillero Activo</span>
            </div>

            <p class="semillero-description">
              {{ semillero.descripcion }}
            </p>

            <!-- PROYECTOS DESARROLLADOS -->
            <div class="proyectos-wrapper">
              <div class="proyectos-subtitle">Proyectos de Investigación del Semillero</div>

              <div class="proyectos-grid">
                <div class="proyecto-box en-ejecucion">
                  <span class="proyecto-tag">Proyecto Actual (En Ejecución)</span>
                  <h5>{{ semillero.proyectoActual.titulo }}</h5>
                  <p>{{ semillero.proyectoActual.descripcion }}</p>
                </div>

                @for (pTerm of semillero.proyectosTerminados; track pTerm.titulo) {
                  <div class="proyecto-box">
                    <span class="proyecto-tag">Proyecto Concluido</span>
                    <h5>{{ pTerm.titulo }}</h5>
                    <p>{{ pTerm.descripcion }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- INTEGRANTES ESTUDIANTILES (5 TARJETAS INDIVIDUALES IMPECABLES) -->
            <div class="integrantes-wrapper">
              <div class="integrantes-subtitle">Estudiantes Investigadores Integrantes</div>

              <div class="integrantes-grid-5">
                @for (member of semillero.integrantes; track member.nombre) {
                  <div class="member-card">
                    <img [src]="member.fotoUrl" [alt]="member.nombre" class="member-photo" />
                    <span class="member-name">{{ member.nombre }}</span>
                    <span class="member-role">{{ member.rol }}</span>
                    <span class="member-semestre">{{ member.semestre }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </main>

    <!-- FOOTER INSTITUCIONAL -->
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
export class InvestigacionComponent {
  readonly lineasInvestigacion: LineaInvestigacion[] = [
    {
      titulo: 'Ciencia, Tecnología e Innovación',
      descripcion: 'Investigación orientada a la creación de modelos computacionales avanzados, desarrollo de software adaptativo y redes distribuidas de alto desempeño.',
      sublineas: [
        {
          nombre: 'Desarrollo de Software Distribuido & Cloud',
          descripcion: 'Patrones de arquitectura de microservicios, APIs resilientes y computación distribuida.'
        },
        {
          nombre: 'Sistemas Inteligentes & Analítica de Datos',
          descripcion: 'Modelos de machine learning, visión por computador y analítica predictiva.'
        },
        {
          nombre: 'Infraestructura & Redes de Alta Velocidad',
          descripcion: 'Optimización de protocolos de comunicación, ciberseguridad y telefonía IP.'
        }
      ]
    },
    {
      titulo: 'Ciencia, Tecnología, Innovación y Sociedad',
      descripcion: 'Línea de investigación enfocada en la apropiación social del conocimiento y el impacto tecnológico en la transformación comunitaria de Buenaventura.',
      sublineas: [
        {
          nombre: 'Inclusión Digital & Apropiación Social',
          descripcion: 'Estrategias tecnológicas para el cierre de la brecha digital en comunidades del Pacífico.'
        },
        {
          nombre: 'Informática Educativa del Pacífico',
          descripcion: 'Plataformas de aprendizaje adaptativo y herramientas didácticas digitales.'
        },
        {
          nombre: 'Gestión Tecnológica Territorial',
          descripcion: 'Sistemas de información para la gobernanza, medio ambiente y desarrollo sostenible.'
        }
      ]
    }
  ];

  readonly semillerosInvestigacion: SemilleroInvestigacion[] = [
    {
      nombre: 'Semillero de Inteligencia Computacional',
      sigla: 'SIC',
      descripcion: 'Espacio de formación investigativa dedicado a la exploración y desarrollo de algoritmos de inteligencia artificial, procesamiento de lenguaje natural y modelos predictivos.',
      proyectoActual: {
        titulo: 'Sistema Predictivo de Rendimiento Académico Universitario',
        descripcion: 'Implementación de modelos de redes neuronales para la detección temprana de riesgo de deserción estudiantil.'
      },
      proyectosTerminados: [
        {
          titulo: 'Plataforma de Diagnóstico Agro-Ambiental Territorial',
          descripcion: 'Procesamiento de imágenes satelitales para la clasificación de cobertura de suelo en el Valle del Cauca.'
        }
      ],
      integrantes: [
        { nombre: 'Camilo Torres', rol: 'Líder Estudiantil', semestre: '8.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Daniel Valencia', rol: 'Investigador IA', semestre: '7.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Esteban Rentería', rol: 'Desarrollador Datos', semestre: '6.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Kevin Angulo', rol: 'Analista de Modelos', semestre: '5.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Mateo Caicedo', rol: 'Asistente de Pruebas', semestre: '4.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80' }
      ]
    },
    {
      nombre: 'Semillero de Desarrollo Web & Sistemas Distribuidos',
      sigla: 'SDWS',
      descripcion: 'Semillero enfocado en la investigación aplicada de estándares de desarrollo web moderno, arquitecturas desacopladas y seguridad en plataformas en la nube.',
      proyectoActual: {
        titulo: 'Arquitectura de Microservicios para Portales Institucionales',
        descripcion: 'Diseño de un framework distribuido ligero en Node.js y Angular para servicios educativos universitarios.'
      },
      proyectosTerminados: [
        {
          titulo: 'Monitor y Analizador de Tráfico de Redes Universitarias',
          descripcion: 'Herramienta en tiempo real para el diagnóstico de latencia y uso de ancho de banda en la red de campus.'
        }
      ],
      integrantes: [
        { nombre: 'Santiago Córdoba', rol: 'Líder Estudiantil', semestre: '9.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Felipe Mosquera', rol: 'Desarrollador Fullstack', semestre: '8.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Andrés Rivas', rol: 'Especialista API', semestre: '7.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Julián Mina', rol: 'Desarrollador Frontend', semestre: '6.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' },
        { nombre: 'Diego Quiñones', rol: 'Analista QA', semestre: '5.° Semestre', fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' }
      ]
    }
  ];
}
