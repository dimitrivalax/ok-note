import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from '../services/i18n.service';

/**
 * Translates a message key using the current runtime locale.
 */
@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);

  /**
   * Resolves a translation key, optionally interpolating params.
   */
  transform(key: string, params?: Record<string, string | number>): string {
    this.i18nService.locale();
    return this.i18nService.t(key, params);
  }
}
