import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../shared/services/feedback.service';

@Component({
  selector: 'app-pago-supletorio',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pago-supletorio.component.html',
  styles: [`
    .seccion-tutorial {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .seccion-tutorial h3 {
      font-size: 1.1rem;
      color: #0a2463;
      margin-bottom: 1.25rem;
    }

    .pasos {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .paso {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .paso-numero {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      background: #0a2463;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .paso-contenido {
      flex: 1;
      padding-top: 0.35rem;
    }

    .paso-contenido strong {
      display: block;
      margin-bottom: 0.2rem;
      color: #1a1a1a;
    }

    .paso-contenido p {
      color: #555;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .paso-contenido .resaltar {
      background: #e8eeff;
      color: #0a2463;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .seccion-academusoft {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-top: 1.5rem;
      text-align: center;
    }

    .seccion-academusoft p {
      color: #555;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .btn-academusoft {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #1a6fbf;
      color: #fff;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-academusoft:hover {
      background: #145a9e;
    }

    .btn-academusoft svg {
      width: 20px;
      height: 20px;
    }

    .seccion-comprobante {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .seccion-comprobante h3 {
      font-size: 1.1rem;
      color: #0a2463;
      margin-bottom: 0.5rem;
    }

    .seccion-comprobante > p {
      color: #555;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .dropzone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }

    .dropzone:hover {
      border-color: #3da5d9;
      background: #f0f7ff;
    }

    .dropzone.arrastrando {
      border-color: #0a2463;
      background: #e8eeff;
    }

    .dropzone-icono {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .dropzone-texto {
      color: #555;
      font-size: 0.9rem;
    }

    .dropzone-texto strong {
      color: #0a2463;
    }

    .dropzone-input {
      display: none;
    }

    .archivo-cargado {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 0.75rem 1rem;
      border-radius: 6px;
    }

    .archivo-cargado-icono {
      font-size: 1.5rem;
    }

    .archivo-cargado-info {
      flex: 1;
    }

    .archivo-cargado-info .nombre {
      font-weight: 600;
      font-size: 0.9rem;
      color: #155724;
    }

    .archivo-cargado-info .tamano {
      font-size: 0.8rem;
      color: #155724;
      opacity: 0.8;
    }

    .btn-quitar-archivo {
      background: transparent;
      color: #c0392b;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.3rem 0.5rem;
    }

    .btn-quitar-archivo:hover {
      text-decoration: underline;
    }

    .btn-enviar {
      margin-top: 1rem;
      padding: 0.6rem 1.5rem;
    }

    .btn-enviar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
})
export class PagoSupletorioComponent {

  private feedbackService = inject(FeedbackService);

  archivoComprobante = signal<File | null>(null);
  arrastrando = signal(false);
  subiendo = signal(false);

  readonly urlAcademusoft = 'https://www.unipacifico.edu.co/p/46/sistemas-y-tecnologia/academusoft';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando.set(false);

    const archivos = event.dataTransfer?.files;
    if (archivos && archivos.length > 0) {
      this.procesarArchivo(archivos[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  private procesarArchivo(archivo: File): void {
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
      this.feedbackService.show('Solo se permiten archivos PDF, JPG, PNG o WebP.', 'error');
      return;
    }

    const maxSizeMB = 10;
    if (archivo.size > maxSizeMB * 1024 * 1024) {
      this.feedbackService.show(`El archivo no debe superar ${maxSizeMB} MB.`, 'error');
      return;
    }

    this.archivoComprobante.set(archivo);
  }

  eliminarArchivo(): void {
    this.archivoComprobante.set(null);
  }

  formatTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  enviarComprobante(): void {
    const archivo = this.archivoComprobante();
    if (!archivo) return;

    this.subiendo.set(true);

    setTimeout(() => {
      this.feedbackService.show('Comprobante de pago enviado exitosamente.', 'success');
      this.archivoComprobante.set(null);
      this.subiendo.set(false);
    }, 1500);
  }
}
