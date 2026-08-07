import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-programa',
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

    .page-hero h1 {
      font-size: 3.2rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.035em;
      line-height: 1.1;
      margin-bottom: 1.25rem;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .page-hero p {
      font-size: 1.1rem;
      color: #e2e8f0;
      line-height: 1.65;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    /* ===== PAGE BODY & EDITORIAL SECTIONS ===== */
    .page-body {
      padding: 4rem 2rem 6rem;
      max-width: 1240px;
      margin: 0 auto;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 4.5rem 0;
    }

    /* FICHA TÉCNICA BARRA RESUMEN */
    .ficha-tecnica-bar {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
      margin-bottom: 4.5rem;
    }

    .ft-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
      transition: all 0.25s ease;
    }

    .ft-card:hover {
      border-color: #15803d;
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(21, 128, 61, 0.08);
    }

    .ft-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: #f0fdf4;
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .ft-icon svg { width: 22px; height: 22px; }

    .ft-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .ft-value {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
    }

    .ft-subvalue {
      font-size: 0.78rem;
      color: #15803d;
      font-weight: 700;
      margin-top: 0.2rem;
    }

    /* MISIÓN Y VISIÓN 2 COLUMNAS */
    .mision-vision-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      margin-bottom: 4.5rem;
    }

    .mv-card {
      background: #ffffff;
      border: 1.5px solid #bbf7d0;
      border-radius: 22px;
      padding: 2.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 8px 24px rgba(21, 128, 61, 0.04);
      transition: all 0.3s ease;
    }

    .mv-card:hover {
      border-color: #15803d;
      box-shadow: 0 12px 32px rgba(21, 128, 61, 0.1);
      transform: translateY(-3px);
    }

    .mv-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mv-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(21, 128, 61, 0.3);
    }

    .mv-icon-circle svg { width: 26px; height: 26px; }

    .mv-card h3 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
    }

    .mv-card p {
      font-size: 1.02rem;
      color: #334155;
      line-height: 1.75;
    }

    /* PERFILES PROFESIONAL Y OCUPACIONAL */
    .perfiles-section {
      margin-bottom: 4.5rem;
    }

    .perfiles-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      margin-top: 1.75rem;
    }

    .perfil-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .perfil-card h4 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .perfil-card p {
      font-size: 1.02rem;
      color: #334155;
      line-height: 1.75;
      margin: 0;
    }

    /* CONTACTO INSTITUCIONAL BLOCK */
    .contacto-institucional-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 24px;
      padding: 3rem 3.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.15);
    }

    .contacto-info h3 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    .contacto-info p {
      font-size: 1rem;
      color: #94a3b8;
      margin: 0;
    }

    .contacto-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-end;
    }

    .contacto-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.95rem;
      color: #4ade80;
      font-weight: 700;
    }

    .contacto-item svg { width: 20px; height: 20px; }

    /* FOOTER */
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

    .footer-brand h4 { color: #ffffff; font-size: 1.3rem; font-weight: 900; margin-bottom: 0.85rem; }
    .footer-brand p { color: rgba(255, 255, 255, 0.85); font-size: 0.9rem; line-height: 1.65; max-width: 350px; }
    .footer-col h5 { color: #ffffff; font-size: 0.9rem; font-weight: 800; margin-bottom: 1.25rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .footer-links a { color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; text-decoration: none; }
    .footer-links a:hover { color: #ffffff; text-decoration: underline; }

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

    @media (max-width: 1024px) {
      .ficha-tecnica-bar { grid-template-columns: repeat(3, 1fr); }
      .mision-vision-grid, .perfiles-grid { grid-template-columns: 1fr; }
      .contacto-institucional-box { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .contacto-details { align-items: flex-start; }
      .footer-container { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 640px) {
      .landing-header { padding: 0.75rem 1.25rem; }
      .nav-menu { display: none; }
      .page-hero { padding: 8rem 1.5rem 4rem; }
      .page-hero h1 { font-size: 2.2rem; }
      .ficha-tecnica-bar { grid-template-columns: 1fr; }
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
            <li><a routerLink="/programa" class="active">El Programa</a></li>
            <li><a routerLink="/landing" fragment="acerca">Acerca de</a></li>
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

    <!-- HERO CON IMAGEN BRLLANTE -->
    <section class="page-hero">
      <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80" alt="Estudiantes de Ingeniería de Sistemas UNPA" class="hero-bg-image" />
      <div class="hero-overlay"></div>

      <div class="page-hero-container">
        <h1>Programa de <span>Ingeniería de Sistemas</span></h1>
        <p>
          Universidad del Pacífico — Formación profesional comprometida con el desarrollo social y tecnológico de la región del Pacífico colombiano.
        </p>
      </div>
    </section>

    <!-- CUERPO OFICIAL DEL PROGRAMA -->
    <main class="page-body">
      <!-- BARRA DE INFORMACIÓN ACADÉMICA OFICIAL -->
      <div class="ficha-tecnica-bar">
        <div class="ft-card">
          <div class="ft-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/>
            </svg>
          </div>
          <span class="ft-label">Título Otorgado</span>
          <span class="ft-value">Ingeniero(a) de Sistemas</span>
        </div>

        <div class="ft-card">
          <div class="ft-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span class="ft-label">Duración</span>
          <span class="ft-value">9 Semestres</span>
          <span class="ft-subvalue">160 Créditos</span>
        </div>

        <div class="ft-card">
          <div class="ft-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span class="ft-label">Modalidad</span>
          <span class="ft-value">Presencial</span>
        </div>

        <div class="ft-card">
          <div class="ft-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span class="ft-label">Registro Calificado</span>
          <span class="ft-value">Res. 02958 (22 Feb 2018)</span>
        </div>

        <div class="ft-card">
          <div class="ft-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <span class="ft-label">Código SNIES</span>
          <span class="ft-value">90996</span>
        </div>
      </div>

      <!-- MISIÓN Y VISIÓN OFICIALES -->
      <section class="mision-vision-grid">
        <div class="mv-card">
          <div class="mv-card-header">
            <div class="mv-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <h3>Misión</h3>
          </div>
          <p>
            Formar profesionales integrales, comprometidos con el desarrollo del país y en especial la región pacífica, involucrando responsablemente en los procesos de transformación las tecnologías de la información y la comunicación.
          </p>
        </div>

        <div class="mv-card">
          <div class="mv-card-header">
            <div class="mv-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3>Visión</h3>
          </div>
          <p>
            En el año 2024 el programa será reconocido por la calidad en sus procesos de formación, con estudiantes y docentes involucrados en proyectos enmarcados en el mejoramiento de la calidad de vida especialmente en la región pacifica, haciendo uso racional y oportuno de la tecnología con el objeto de mejorar la eficiencia y competitividad de las organizaciones.
          </p>
        </div>
      </section>

      <!-- PERFIL PROFESIONAL Y PERFIL OCUPACIONAL OFICIALES -->
      <section class="perfiles-section">
        <div class="perfiles-grid">
          <div class="perfil-card">
            <h4>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Perfil Profesional
            </h4>
            <p>
              El profesional en Ingeniería de Sistemas es un profesional integral conocedor del medio en que se desenvuelve, solvente en la aplicación del conocimiento, metodologías y recursos de la ingeniería de sistemas en el manejo productivo de la información dentro de las organizaciones y preparado para enfrentar el reto de liderar su propia empresa. Su preparación investigativa y su idoneidad profesional le permitirán promover y gerenciar proyectos informáticos, conducentes a la modernización y competitividad del aparato productivo, con conocimientos específicos en logística, y comprometido con Colombia y su profesión.
            </p>
          </div>

          <div class="perfil-card">
            <h4>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
              </svg>
              Perfil Ocupacional
            </h4>
            <p>
              Los perfiles de formación responden a las necesidades de la región, a propuestas nacionales de entidades como el Ministerio de las TIC y ACOFI, a las tendencias del mercado y lineamientos de formación internacional que se mencionaron en el capítulo de denominación del programa.
            </p>
          </div>
        </div>
      </section>

      <!-- INFORMACIÓN DE CONTACTO DEL PROGRAMA -->
      <section class="contacto-institucional-box">
        <div class="contacto-info">
          <h3>Información de Contacto del Programa</h3>
          <p>Universidad del Pacífico — Programa de Ingeniería de Sistemas</p>
        </div>

        <div class="contacto-details">
          <div class="contacto-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>Tel. (2) 2405555 ext. 3910</span>
          </div>

          <div class="contacto-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>ingsistemas&#64;unipacifico.edu.co</span>
          </div>
        </div>
      </section>
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
export class ProgramaComponent {}
