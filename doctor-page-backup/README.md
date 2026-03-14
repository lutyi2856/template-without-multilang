# Backup страницы врача (Doctor Page)

**Дата:** 2026-02-12  
**Источник:** stash `current-state-before-check`

## Что здесь

Копия всех файлов, связанных со страницей врача, до восстановления проекта из `origin/main`.

## Как добавлять блоки обратно

1. **Сначала** убедиться, что проект собирается после `git reset --hard origin/main`
2. **По одному блоку** копировать из backup в проект
3. **Блок отзывов** (reviews) — добавлять последним, т.к. он ломал сборку

## Структура файлов backup → проект

| Backup файл | Путь в проекте |
|-------------|----------------|
| doctors-slug-page.tsx | nextjs/src/app/doctors/[slug]/page.tsx |
| doctor-page-index.ts | nextjs/src/components/figma/doctor-page/index.ts |
| doctor-page-types.ts | nextjs/src/components/figma/doctor-page/types.ts |
| doctor-about-block.tsx | nextjs/src/components/figma/doctor-page/doctor-about-block.tsx |
| doctor-certificates-block.tsx | nextjs/src/components/figma/doctor-page/doctor-certificates-block.tsx |
| doctor-certificates-block-client.tsx | nextjs/src/components/figma/doctor-page/doctor-certificates-block-client.tsx |
| doctor-directions-block.tsx | nextjs/src/components/figma/doctor-page/doctor-directions-block.tsx |
| doctor-education-block.tsx | nextjs/src/components/figma/doctor-page/doctor-education-block.tsx |
| doctor-offer-block.tsx | nextjs/src/components/figma/doctor-page/doctor-offer-block.tsx |
| doctor-platform-reviews-block.tsx | **ОТЗЫВЫ** — nextjs/src/components/figma/doctor-page/doctor-platform-reviews-block.tsx |
| doctor-review-card.tsx | **ОТЗЫВЫ** — nextjs/src/components/figma/doctor-page/doctor-review-card.tsx |
| doctor-reviews-block.tsx | **ОТЗЫВЫ** — nextjs/src/components/figma/doctor-page/doctor-reviews-block.tsx |
| doctor-reviews-list-client.tsx | **ОТЗЫВЫ** — nextjs/src/components/figma/doctor-page/doctor-reviews-list-client.tsx |
| queries-doctors.ts | nextjs/src/lib/wordpress/queries/doctors.ts |
| types-review.ts | nextjs/src/lib/wordpress/types/review.ts |
| api.ts | nextjs/src/lib/wordpress/api.ts (мёржить вручную!) |
| images/ | nextjs/public/images/figma/ |
| fill-doctor-*.php | scripts/ |
| register-doctors-clinics-graphql.php | wp-content/mu-plugins/ |
| unident-acf-fields.php | wp-content/mu-plugins/ (мёржить вручную!) |

## Порядок добавления (без отзывов сначала)

1. queries-doctors.ts, types-review.ts
2. В api.ts — добавить поля Doctor (platformReviews, relatedReviews, education, certificates, content)
3. doctor-about-block, doctor-directions-block, doctor-education-block, doctor-certificates-block
4. doctor-offer-block
5. doctors-slug-page.tsx (обновить импорты под добавленные блоки)
6. doctor-page-index.ts, doctor-page-types.ts
7. **В последнюю очередь** — блоки отзывов (doctor-reviews-block, doctor-platform-reviews-block, doctor-review-card, doctor-reviews-list-client)
