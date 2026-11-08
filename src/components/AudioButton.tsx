import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakJapanese } from '../utils/kanaUtils';

interface AudioButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  size = 'md',
  className = '',
  title = '点击发音',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakJapanese(text);
    setTimeout(() => {
      setIsPlaying(false);
    }, 1200);
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`inline-flex items-center justify-center rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer ${sizeClasses[size]} ${
        isPlaying ? 'text-indigo-600 bg-indigo-100 ring-2 ring-indigo-300 animate-pulse' : ''
      } ${className}`}
      title={title}
      aria-label={`朗读 ${text}`}
    >
      <Volume2 size={iconSizes[size]} className={isPlaying ? 'scale-110' : ''} />
    </button>
  );
};
