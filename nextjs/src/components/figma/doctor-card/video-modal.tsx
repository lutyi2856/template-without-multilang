/**
 * VideoModal - модальное окно с YouTube видео врача
 * 
 * PERFORMANCE: Client Component (интерактивность - state, модал)
 */

'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoModalProps {
  videoUrl: string;
  doctorName: string;
}

/**
 * Извлекает YouTube ID из URL
 */
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function VideoModal({ videoUrl, doctorName }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const youtubeId = getYouTubeId(videoUrl);

  return (
    <>
      {/* Кнопка открытия видео */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-[200.26px] left-[252.54px] w-[60px] h-[60px] bg-[#526AC2] rounded-full flex items-center justify-center hover:bg-[#4558a8] transition-colors group"
        aria-label={`Смотреть видео о враче ${doctorName}`}
      >
        <Play className="w-6 h-6 text-white fill-white ml-1" />
      </button>

      {/* Модальное окно */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black">
          <DialogHeader className="sr-only">
            <DialogTitle>Видео о враче {doctorName}</DialogTitle>
          </DialogHeader>
          
          {/* Кнопка закрытия */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Закрыть видео"
          >
            <X className="w-6 h-6" />
          </button>

          {/* YouTube iframe */}
          {youtubeId && (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={`Видео о враче ${doctorName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
