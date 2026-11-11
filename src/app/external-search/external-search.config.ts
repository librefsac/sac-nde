import { InjectionToken } from '@angular/core';

export interface SearchTarget {
  name: string;
  url: string; // everything up to the point where the search words go
  img?: string;
  alt?: string;
  mapping: (queries: string[], filters: string[]) => string;
}

export interface ExternalSearchOptions {
  facetName: string;
  searchTargets: SearchTarget[];
}

/** "any,contains,some term,AND" -> "some term" (tolerates commas inside the term) */
export function parsePrimoTerm(part: string): string {
  const fields = part.split(',');
  if (fields.length > 3 && /^(AND|OR|NOT)$/i.test(fields[fields.length - 1])) {
    fields.pop();
  }
  return fields.slice(2).join(',');
}

const plainTerms = (queries: string[]): string =>
  queries.map(parsePrimoTerm).filter(Boolean).join(' ');

export const EXTERNAL_SEARCH_OPTIONS = new InjectionToken<ExternalSearchOptions>(
  'EXTERNAL_SEARCH_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      facetName: 'Search Other Libraries',
      searchTargets: [
        {
          name: 'Santa Ana Public Library',
          url: 'https://sapl.tlcdelivers.com/#section=searchresults&term=', // verify, see below
          alt: 'Santa Ana Public Library',
          mapping: plainTerms,
        },
        {
          name: 'Orange County Public Library',
          url: 'https://catalog.ocpl.org/client/en_US/default/search/results?qu=', // verify, see below
          alt: 'Orange County Public Library',
          mapping: plainTerms,
        },
      ],
    }),
  }
);