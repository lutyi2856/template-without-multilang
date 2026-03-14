import { gql } from '@apollo/client';

/**
 * Настройки WordPress (Settings → General)
 * Используется для форматирования дат в часовом поясе сайта.
 */

export const GET_GENERAL_SETTINGS = gql`
  query GetGeneralSettings {
    generalSettings {
      timezone
    }
  }
`;
