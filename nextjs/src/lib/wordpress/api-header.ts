/**
 * API функции для загрузки данных header
 * 
 * Server-side функции для React Server Components
 */

import { getApolloClient } from './client';
import { 
  GET_PRIMARY_MENU,
  GET_HEADER_SETTINGS,
  GET_ALL_SERVICE_CATEGORIES
} from './queries';
import { getServicesDropdownData, type ServicesDropdownData } from './api';
import type { Menu, HeaderSettings, ServiceCategory } from '@/types';

/**
 * Получить данные для header (меню, настройки, категории, services dropdown)
 */
export async function getHeaderData() {
  const client = getApolloClient();

  try {
    console.log('[Header Data] Starting to fetch header data...');
    
    // Параллельная загрузка всех данных
    // fetchPolicy: 'network-only' - всегда запрашивать свежие данные с сервера
    const [menuResult, settingsResult, categoriesResult, servicesDropdownData] = await Promise.all([
      client.query<{ menu: Menu }>({
        query: GET_PRIMARY_MENU,
        fetchPolicy: 'network-only',
      }),
      client.query<{ headerSettings: HeaderSettings }>({
        query: GET_HEADER_SETTINGS,
        fetchPolicy: 'network-only',
      }),
      client.query<{ serviceCategories: { nodes: ServiceCategory[] } }>({
        query: GET_ALL_SERVICE_CATEGORIES,
        variables: {
          first: 20,
          hideEmpty: true,
        },
        fetchPolicy: 'network-only',
      }),
      getServicesDropdownData(),
    ]);

    console.log('[Header Data] Menu result:', JSON.stringify(menuResult.data, null, 2));
    console.log('[Header Data] Menu errors:', JSON.stringify(menuResult.errors, null, 2));
    console.log('[Header Data] Settings result:', JSON.stringify(settingsResult.data, null, 2));
    console.log('[Header Data] Settings errors:', JSON.stringify(settingsResult.errors, null, 2));
    console.log('[Header Data] Categories result:', JSON.stringify(categoriesResult.data, null, 2));
    console.log('[Header Data] Services Dropdown result:', JSON.stringify(servicesDropdownData, null, 2));

    return {
      menu: menuResult.data.menu,
      settings: settingsResult.data.headerSettings || null,
      categories: categoriesResult.data.serviceCategories.nodes || [],
      servicesDropdown: servicesDropdownData,
    };
  } catch (error) {
    console.error('[Header Data] Error fetching header data:', error);
    if (error instanceof Error) {
      console.error('[Header Data] Error message:', error.message);
      console.error('[Header Data] Error stack:', error.stack);
    }
    return {
      menu: null,
      settings: null,
      categories: [],
      servicesDropdown: {
        categories: [],
        services: [],
        featuredService: null,
      },
    };
  }
}

/**
 * Получить только меню
 */
export async function getPrimaryMenu() {
  const client = getApolloClient();

  try {
    const { data } = await client.query<{ menu: Menu }>({
      query: GET_PRIMARY_MENU,
    });

    return data.menu;
  } catch (error) {
    console.error('Error fetching primary menu:', error);
    return null;
  }
}

/**
 * Получить только настройки header
 */
export async function getHeaderSettings() {
  const client = getApolloClient();

  try {
    const { data } = await client.query<{ headerSettings: HeaderSettings | null }>({
      query: GET_HEADER_SETTINGS,
    });

    return data.headerSettings ?? null;
  } catch (error) {
    console.error('Error fetching header settings:', error);
    return null;
  }
}

/**
 * Получить категории услуг для мега-меню
 */
export async function getServiceCategories() {
  const client = getApolloClient();

  try {
    const { data } = await client.query<{ serviceCategories: { nodes: ServiceCategory[] } }>({
      query: GET_ALL_SERVICE_CATEGORIES,
      variables: {
        first: 20,
        hideEmpty: true,
      },
    });

    return data.serviceCategories.nodes || [];
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return [];
  }
}
