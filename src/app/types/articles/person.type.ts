import { Article, Query } from "@sinequa/atomic";
import { DEFAULT_QUERY_NAME } from "../../config/query-names";
import { Filter } from "@/app/utils/models";

export type PersonArticle = Article & {
  employeeDepartments?: string[];
  employeeEmail?: string;
  employeeFirstName?: string;
  employeeFullName?: string;
  employeeJobTitle?: string;
  employeeLastName?: string;
  employeeLocations?: string[];
  employeePhone?: string;
  employeePhotoURL?: string;
}

export type InstantMessaging = {
  label: string;
  href: string;
  iconClass: string;
};

export const PERSON_RELATED_TO_QUERY_NAME = DEFAULT_QUERY_NAME;
export const PERSON_RECENT_CONTRIBUTIONS_QUERY_NAME = DEFAULT_QUERY_NAME;
export const PERSON_SORTING_DATE_COLUMN = 'date';

export function getPersonIms(person: Partial<PersonArticle> | undefined): InstantMessaging[] {
  if (!person) return [];

  const ims = [] as InstantMessaging[];

  person.employeePhone ? ims.push({
    label: `Call ${person.employeeFullName ?? 'that person'}`,
    href: `tel:${person.employeePhone}`,
    iconClass: 'far fa-phone-alt'
  }) : undefined;

  person.employeeEmail ? ims.push({
    label: `Send an email to ${person.employeeFullName ?? 'that person'}`,
    href: `mailto:${person.employeeEmail}`,
    iconClass: 'far fa-envelope'
  }) : undefined;

  return ims;
}

export function getPersonRecentContributionsQueryAndFilters(person: Partial<PersonArticle> | undefined): [Query, Filter[]] | undefined {
  if (!person || !person.employeeFullName) return undefined;

  const filters = [{ column: 'authors', values: [person?.employeeFullName], label: 'Authors' }];
  const query: Query = {
    name: PERSON_RECENT_CONTRIBUTIONS_QUERY_NAME,
    text: '',
    pageSize: 3,
    sort: PERSON_SORTING_DATE_COLUMN,
  };

  return [query, filters];
}

export function getPersonRelatedToQueryAndFilters(person: Partial<PersonArticle> | undefined): [Query, Filter[]] | undefined {
  if (!person || !person.employeeFullName) return undefined;

  const filters = [{ column: 'authors', values: [person?.employeeFullName], label: 'Authors' }];
  const query: Query = { name: PERSON_RELATED_TO_QUERY_NAME, pageSize: 3 };

  return [query, filters];
}
