<?php
/**
 * Doctor Education Parser — извлечение года, очистка place, определение education_type
 *
 * Используется в migrate-doctor-education.php и import-kan-doctors-education.php
 */

/**
 * Извлечь годы из текста (19xx, 20xx, 19xx–20xx, 20xx-20xx)
 *
 * @param string $text Исходный текст
 * @return string|null Первый найденный год или диапазон (формат "2019" или "2019-2024")
 */
function doctor_education_extract_year($text) {
    if (empty($text) || !is_string($text)) {
        return null;
    }
    if (preg_match('/(?:19|20)\d{2}(?:\s*[–\-]\s*(?:19|20)\d{2})?/u', $text, $m)) {
        $year = preg_replace('/[\x{2013}\x{2014}]/u', '-', trim($m[0]));
        return $year ?: null;
    }
    return null;
}

/**
 * Очистить place от годов и лишних пробелов
 *
 * @param string $text Исходный текст
 * @return string Очищенный текст
 */
function doctor_education_clean_place($text) {
    if (empty($text) || !is_string($text)) {
        return '';
    }
    $place = preg_replace('/(?:19|20)\d{2}\s*г?\.?\s*[–\-]?\s*(?:19|20)\d{2}\s*г?\.?/u', '', $text);
    $place = preg_replace('/(?:19|20)\d{2}\s*г?\.?/u', '', $place);
    $place = preg_replace('/^[\s.,;]*гг?\.?\s*/u', '', $place);
    $place = preg_replace('/Курсы:\s*$/u', '', $place);
    $place = trim(preg_replace('/\s+/', ' ', $place), " \t\n\r\0\x0B,");
    return $place;
}

/**
 * Определить тип обучения по ключевым словам (порядок проверок важен)
 *
 * @param string $text Исходный текст
 * @return string Один из: стационар, ординатура, резидентура, магистратура, курсы, семинар, повышение квалификации, колледж
 */
function doctor_education_detect_type($text) {
    if (empty($text) || !is_string($text)) {
        return 'курсы';
    }
    $t = mb_strtolower($text);
    if (strpos($t, 'ординатура') !== false || strpos($t, 'ординатур') !== false) {
        return 'ординатура';
    }
    if (strpos($t, 'резидентура') !== false) {
        return 'резидентура';
    }
    if (strpos($t, 'магистратура') !== false) {
        return 'магистратура';
    }
    if (preg_match('/семинар|конгресс|симпозиум|конференц/i', $t)) {
        return 'семинар';
    }
    if (preg_match('/повышение квалификации|усовершенствования врачей|ташиув|гиув/i', $t)) {
        return 'повышение квалификации';
    }
    if (strpos($t, 'колледж') !== false) {
        return 'колледж';
    }
    if (preg_match('/институт|университет|академия|факультет/i', $t)) {
        return 'стационар';
    }
    if (preg_match('/курс|практикум|лекционн|мастер-класс|course|cource|school|эндопрактикум/i', $t)) {
        return 'курсы';
    }
    return 'курсы';
}

/**
 * Проверить, является ли строка описанием трудоустройства (не образование)
 *
 * @param string $text Текст записи
 * @return bool true если пропустить (трудоустройство)
 */
function doctor_education_is_employment($text) {
    if (empty($text) || !is_string($text)) {
        return true;
    }
    $t = mb_strtolower($text);
    if (strpos($t, 'является ассистентом') !== false) {
        return true;
    }
    if (strpos($t, 'по настоящее время') !== false && preg_match('/клиника|dental clinic|kan\s/i', $t)) {
        return true;
    }
    if (preg_match('/^\d{4}[–\-]\s*(?:\d{4}\s+)?клиника/i', $t)) {
        return true;
    }
    if (preg_match('/с\s+\d{4}\s+(?:года\s+)?по\s+настоящее\s+время/i', $t)) {
        return true;
    }
    if (preg_match('/\d{4}[–\-]\s*по\s+наст/i', $t)) {
        return true;
    }
    return false;
}

/**
 * Парсинг одной строки образования в структуру {year, place, education_type}
 *
 * @param string $text Исходный текст (из place или из массива education kan-data)
 * @return array{year: string|null, place: string, education_type: string}
 */
function doctor_education_parse_item($text) {
    $year = doctor_education_extract_year($text);
    $place = doctor_education_clean_place($text);
    $type = doctor_education_detect_type($text);
    return [
        'year' => $year,
        'place' => $place,
        'education_type' => $type,
    ];
}
