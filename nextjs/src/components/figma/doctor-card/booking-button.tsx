/**
 * BookingButton - кнопка записи к врачу
 * 
 * PERFORMANCE: Client Component (интерактивность - onClick)
 */

'use client';

interface BookingButtonProps {
  doctorName: string;
}

export function BookingButton({ doctorName }: BookingButtonProps) {
  const handleClick = () => {
    console.log(`Записаться к врачу: ${doctorName}`);
    // TODO: Здесь будет логика открытия модального окна записи
    // Или редирект на страницу записи
  };

  return (
    <button
      onClick={handleClick}
      className="w-full min-h-[44px] py-4.5 bg-[#526AC2] text-white text-[16px] font-semibold leading-[1.1] rounded-[15px] hover:bg-[#4558a8] transition-colors"
    >
      Записаться
    </button>
  );
}
