import { Component, ElementRef, computed, inject, signal } from '@angular/core';
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
  protected open = signal(true);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Polls the address bar and checks whether this copy sits after the last filter group.
  private state = toSignal(
    interval(500).pipe(
      startWith(0),
      map(() => ({ search: window.location.search, isLast: this.isLastGroup() })),
      distinctUntilChanged((a, b) => a.search === b.search && a.isLast === b.isLast)
    ),
    { initialValue: { search: window.location.search, isLast: false } }
  );

  protected isLast = computed(() => this.state().isLast);
  private params = computed(() => new URLSearchParams(this.state().search));

  protected links = computed(() => {
    const queries = this.params().getAll('query');
    const filters = this.params().getAll('facet');
    if (!queries.length) return [];

    return this.options.searchTargets.map((target) => {
      let mapped = '';
      try {
        mapped = target.mapping(queries, filters);
      } catch {
        mapped = '';
      }
      const encoded = encodeURIComponent(mapped);
      const href = target.url.includes('{term}')
      ? target.url.split('{term}').join(encoded)
      : target.url + encoded;
      return { ...target, href };
      });
  });

  // NDE creates one copy per filter group; only the copy after the last group renders.
  private isLastGroup(): boolean {
    const group = this.host.nativeElement.closest('li')?.querySelector('nde-filters-group');
    const all = document.querySelectorAll('nde-search-filters-side-nav nde-filters-group');
    return !!group && all.length > 0 && group === all[all.length - 1];
  }
}