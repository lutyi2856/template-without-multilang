/**
 * API для данных футера: меню (footer_left, footer_right), footerSettings, contacts, header (fallback часов/подписи).
 */

import { getApolloClient } from './client';
import {
  GET_FOOTER_LEFT_MENU,
  GET_FOOTER_RIGHT_MENU,
  GET_FOOTER_SETTINGS,
  GET_HEADER_SETTINGS,
} from './queries';
import { GET_CONTACTS_SETTINGS } from './queries/contacts';
import type { Menu, FooterSettings, ContactsSettings, HeaderSettings } from '@/types';

export interface FooterData {
  leftMenu: Menu | null;
  rightMenu: Menu | null;
  footerSettings: FooterSettings | null;
  contactsSettings: ContactsSettings | null;
  headerSettings: HeaderSettings | null;
}

const safeQuery = async <T>(fn: () => Promise<{ data?: T }>): Promise<T | null> => {
  try {
    const result = await fn();
    return result.data ?? null;
  } catch {
    return null;
  }
};

/**
 * Получить все данные для футера (меню, настройки футера, контакты, часы из header при необходимости).
 * Каждый запрос в try/catch — падение одного не ломает остальные.
 */
export async function getFooterData(): Promise<FooterData> {
  try {
    const client = getApolloClient();
    const opts = { fetchPolicy: 'network-only' as const };

    const [leftMenu, rightMenu, footerSettings, contactsSettings, headerSettings] = await Promise.all([
      safeQuery(() => client.query<{ menu: Menu | null }>({ query: GET_FOOTER_LEFT_MENU, ...opts })).then((r) => r?.menu ?? null),
      safeQuery(() => client.query<{ menu: Menu | null }>({ query: GET_FOOTER_RIGHT_MENU, ...opts })).then((r) => r?.menu ?? null),
      safeQuery(() => client.query<{ footerSettings: FooterSettings | null }>({ query: GET_FOOTER_SETTINGS, ...opts })).then((r) => r?.footerSettings ?? null),
      safeQuery(() => client.query<{ contactsSettings: ContactsSettings | null }>({ query: GET_CONTACTS_SETTINGS, ...opts })).then((r) => r?.contactsSettings ?? null),
      safeQuery(() => client.query<{ headerSettings: HeaderSettings | null }>({ query: GET_HEADER_SETTINGS, ...opts })).then((r) => r?.headerSettings ?? null),
    ]);

    return {
      leftMenu,
      rightMenu,
      footerSettings,
      contactsSettings,
      headerSettings,
    };
  } catch (error) {
    console.error('[getFooterData] GraphQL/network error:', error);
    return {
      leftMenu: null,
      rightMenu: null,
      footerSettings: null,
      contactsSettings: null,
      headerSettings: null,
    };
  }
}
