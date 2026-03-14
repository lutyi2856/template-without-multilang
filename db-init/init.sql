-- Инициализация базы данных с правильной кодировкой utf8mb4
-- Этот скрипт выполняется автоматически при первом запуске контейнера БД

-- Установка кодировки по умолчанию для сервера
SET character_set_server = 'utf8mb4';
SET collation_server = 'utf8mb4_unicode_ci';

-- Создание базы данных с явным указанием кодировки
CREATE DATABASE IF NOT EXISTS wp_new 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Использование созданной базы данных
USE wp_new;

-- Проверка кодировки (для отладки)
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

