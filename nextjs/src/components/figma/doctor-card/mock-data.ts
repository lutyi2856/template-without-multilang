import { DoctorCardProps } from './types';

/**
 * Фейковые данные для карточек врачей
 * Используются, если динамические данные не переданы
 */
export const mockDoctors: DoctorCardProps[] = [
  {
    name: 'Любимов Павел Олегович',
    description: 'Сертифицированный пластический хирург, профессор, доктор медицинских наук, действительный член РОПРЕХ',
    clinic: 'Клиника на Чайковского',
    experience: 36,
    rating: 4.7,
    ratingSource: 'Doctu.ru',
    imageUrl: '/images/doctors/doctor-1.png', // PNG from Figma with transparent background
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    name: 'Смирнова Елена Викторовна',
    description: 'Стоматолог-терапевт высшей категории, кандидат медицинских наук, специалист по эстетической реставрации',
    clinic: 'Клиника на Невском',
    experience: 28,
    rating: 4.9,
    ratingSource: 'Doctu.ru',
    imageUrl: '/images/doctors/doctor-2.png', // PNG from Figma with transparent background
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    name: 'Козлов Андрей Сергеевич',
    description: 'Стоматолог-ортопед, специалист по имплантации и протезированию, член Европейской ассоциации имплантологов',
    clinic: 'Клиника на Чайковского',
    experience: 22,
    rating: 4.8,
    ratingSource: 'Doctu.ru',
    imageUrl: '/images/doctors/doctor-3.png', // PNG from Figma with transparent background
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    name: 'Петрова Ольга Дмитриевна',
    description: 'Стоматолог-хирург, челюстно-лицевой хирург, специалист по костной пластике и синус-лифтингу',
    clinic: 'Клиника на Невском',
    experience: 19,
    rating: 4.6,
    ratingSource: 'Doctu.ru',
    imageUrl: '/images/doctors/doctor-4.png', // PNG from Figma with transparent background
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

