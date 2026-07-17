import { TestBed } from '@angular/core/testing';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  it('stores and clears a success message', () => {
    const service = TestBed.inject(FeedbackService);

    service.show('Egresado actualizado.');

    expect(service.current()).toEqual({
      message: 'Egresado actualizado.',
      kind: 'success',
    });

    service.clear();

    expect(service.current()).toBeNull();
  });
});
