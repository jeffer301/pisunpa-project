import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-objetivos-proyecto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './objetivos-proyecto.component.html',
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h2 {
      font-size: 1.5rem;
      color: #0a2463;
      margin-bottom: 0.25rem;
    }

    .page-header p {
      color: #718096;
    }

    .seccion-objetivo {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 2rem;
      margin-bottom: 1.5rem;
    }

    .seccion-objetivo h3 {
      font-size: 1.1rem;
      color: #0a2463;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e8eeff;
    }

    .objetivo-texto {
      font-size: 1rem;
      line-height: 1.7;
      color: #2d3748;
    }

    .lista-objetivos {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .lista-objetivos li {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      padding: 1rem 0;
      border-bottom: 1px solid #f0f4ff;
    }

    .lista-objetivos li:last-child {
      border-bottom: none;
    }

    .objetivo-numero {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: #0a2463;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .objetivo-contenido {
      flex: 1;
    }

    .objetivo-contenido strong {
      display: block;
      margin-bottom: 0.25rem;
      color: #1a202c;
    }

    .objetivo-contenido p {
      color: #4a5568;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .creditos {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 2rem;
      text-align: center;
    }

    .creditos h3 {
      font-size: 1.1rem;
      color: #0a2463;
      margin-bottom: 0.5rem;
    }

    .creditos p {
      color: #718096;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    @media (max-width: 600px) {
      .seccion-objetivo {
        padding: 1.25rem;
      }

      .lista-objetivos li {
        flex-direction: column;
        gap: 0.5rem;
      }

      .objetivo-numero {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
      }
    }
  `],
})
export class ObjetivosProyectoComponent {}
