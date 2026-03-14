export interface DoctorCardProps {
  /** Полное имя врача */
  name?: string;

  /** URL slug врача для роутинга */
  slug?: string;

  /** Специализация и описание */
  description?: string;

  /** Специализации врача (из таксономии, через запятую) */
  specialty?: string;

  /** Название клиники */
  clinic?: string;

  /** URL slugs клиник для роутинга (массив соответствует порядку clinic) */
  clinicSlugs?: string[];

  /** Стаж работы в годах */
  experience?: number;

  /** Рейтинг (например, 4.7) */
  rating?: number;

  /** Источник рейтинга (например, Doctu.ru) */
  ratingSource?: string;

  /** URL изображения врача */
  imageUrl?: string;

  /** URL видео о враче (YouTube, Vimeo и т.д.) */
  videoUrl?: string;

  /** Функция вызова при нажатии на кнопку "Записаться" */
  onBookAppointment?: () => void;
}
