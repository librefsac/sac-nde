import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, interval, map, startWith } from 'rxjs';
import { EXTERNAL_SEARCH_OPTIONS } from './external-search.config';

@Component({
  selector: 'app-external-search-facet',
  standalone: true,
  templateUrl: './external-search-facet.component.html',
  styleUrl: './external-search-facet.component.scss',
})
export class ExternalSearchFacetComponent {
  protected options = inject(EXTERNAL_SEARCH_OPTIONS);

  // Polls the address bar so new searches update the links without relying on NDE's router.
  private search = toSignal(
    interval(500).pipe(
      map(() => window.location.search),
      startWith(window.location.search),
      distinctUntilChanged()
    ),
    { initialValue: window.location.search }
  );

  private params = computed(() => new URLSearchParams(this.search()));

  protected links = computed(() => {
    const queries = this.params().getAll('query');
    const filters = this.params().getAll('facet');
    console.log('external-search queries:', queries, window.location.href);
    if (!queries.length) return [];

    return this.options.searchTargets.map((target) => {
      let mapped = '';
      try {
        mapped = target.mapping(queries, filters);
      } catch {
        mapped = '';
      }
      return { ...target, href: target.url + encodeURIComponent(mapped) };
    });
  });
}