import { InjectionToken } from '@angular/core';
import { SAPL_ICON, OCPL_ICON } from './external-search.icons';

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

const FIELDS = /^(any|title|creator|sub|subject|isbn|issn|lsr\d+|rtype)$/i;
const PRECISIONS = /^(contains|exact|begins_with)$/i;

/** Handles "physics" (NDE simple search) and "any,contains,physics,AND" (VE-style) */
export function parsePrimoTerm(part: string): string {
  const fields = part.split(',');
  if (fields.length >= 3 && FIELDS.test(fields[0]) && PRECISIONS.test(fields[1])) {
    if (fields.length > 3 && /^(AND|OR|NOT)$/i.test(fields[fields.length - 1])) {
      fields.pop();
    }
    return fields.slice(2).join(',');
  }
  return part; // plain term, as in NDE's query=physics
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
          url: 'https://sapl.tlcdelivers.com/#section=search&term={term}&page=0&sortKey=Relevancy&db=ls2pac&branchFilters=[%221%22,%223%22,%224%22,%225%22,%226%22,%227%22,%228%22,%229%22,%2210%22,%2211%22,%2212%22]&facetFilters=[]&audience=[]', // verify, see below
          img: SAPL_ICON,
          alt: '',
          mapping: plainTerms,
        },
        {
          name: 'Orange County Public Library',
          url: 'https://catalog.ocpl.org/client/en_US/default/search/results?qu={term}&te=', // verify, see below
          img: OCPL_ICON, 
          alt: '',
          mapping: plainTerms,
        },
      ],
    }),
  }
);