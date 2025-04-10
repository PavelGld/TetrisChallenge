/**
 * Компонент BackgroundMusic - фоновая музыка для игры Тетрис
 * 
 * Этот компонент создает и управляет фоновой музыкой, используя Web Audio API
 * для синтезирования классической мелодии Тетриса вместо загрузки mp3-файла.
 * Музыка воспроизводится во время активной игры и имеет кнопку включения/выключения.
 * 
 * @author Ваше имя
 * @version 1.0
 */

import React, { useState, useEffect, useRef } from 'react';

/**
 * Интерфейс свойств компонента BackgroundMusic
 * 
 * @property isPlaying - Флаг, показывающий, активна ли игра (для автозапуска/остановки музыки)
 */
interface BackgroundMusicProps {
  isPlaying: boolean;
}

/**
 * Компонент фоновой музыки для игры Тетрис
 * 
 * @param props - Свойства компонента BackgroundMusic
 * @returns JSX элемент управления музыкой
 */
export default function BackgroundMusic({ isPlaying }: BackgroundMusicProps) {
  // Состояние отключения звука
  const [isMuted, setIsMuted] = useState(false);
  
  // Ссылки на аудио-элементы
  const audioRef = useRef<HTMLAudioElement | null>(null);        // Резервный аудио-элемент
  const audioContextRef = useRef<AudioContext | null>(null);     // Web Audio API контекст
  const oscillatorRef = useRef<OscillatorNode | null>(null);     // Генератор звуковых волн
  
  /**
   * Эффект для создания и воспроизведения синтезированной музыки
   * 
   * Использует Web Audio API для создания звуков из последовательности нот
   * без необходимости загрузки внешних аудиофайлов. Воспроизводит классическую
   * мелодию Тетриса в 8-битном стиле, повторяя её циклически.
   */
  // При изменении состояния isPlaying (запуск/остановка игры)
  useEffect(() => {
    console.log("BackgroundMusic: isPlaying changed to", isPlaying);
    
    /**
     * Создает синтезированную мелодию Тетриса
     * 
     * @returns Функция для очистки ресурсов (отмена таймеров, закрытие аудио-контекста)
     */
    const createTetrisTheme = () => {
      try {
        // Инициализация Web Audio API - переинициализируем контекст, если необходимо
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          // @ts-ignore - AudioContext может не поддерживаться в старых браузерах
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();
          console.log("Created new AudioContext");
        } else if (audioContextRef.current.state === 'suspended') {
          // Возобновляем контекст, если он приостановлен
          audioContextRef.current.resume().catch(console.error);
          console.log("Resumed AudioContext");
        }
        
        const ctx = audioContextRef.current;
        
        // Создаем узел усиления для управления громкостью
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15; // Устанавливаем низкую громкость (15%)
        gainNode.connect(ctx.destination);
        
        // Основная мелодия Тетриса (ноты в виде частот)
        const tetrisNotes = [
          659.25, // E5
          493.88, // B4
          523.25, // C5
          587.33, // D5
          523.25, // C5
          493.88, // B4
          440.00, // A4
          440.00, // A4
          523.25, // C5
          587.33, // D5
          659.25, // E5
          587.33, // D5
          523.25, // C5
          493.88, // B4
          493.88  // B4
        ];
        
        // Длительность каждой ноты в секундах
        const noteDuration = 0.2;
        
        // Запускаем ноты последовательно
        let time = ctx.currentTime;
        
        // Функция для проигрывания одной ноты
        const playNote = (frequency: number, time: number) => {
          const oscillator = ctx.createOscillator();
          oscillator.type = 'square'; // Квадратная волна даёт чипсет-звучание
          oscillator.frequency.value = frequency;
          
          oscillator.connect(gainNode);
          oscillator.start(time);
          oscillator.stop(time + noteDuration);
        };
        
        // Проигрываем все ноты последовательно
        for (let i = 0; i < tetrisNotes.length; i++) {
          playNote(tetrisNotes[i], time);
          time += noteDuration;
        }
        
        // Циклически воспроизводим мелодию
        const loopInterval = noteDuration * tetrisNotes.length;
        const loopMusic = setInterval(() => {
          if (!isMuted && isPlaying && audioContextRef.current) {
            time = audioContextRef.current.currentTime;
            for (let i = 0; i < tetrisNotes.length; i++) {
              playNote(tetrisNotes[i], time);
              time += noteDuration;
            }
          }
        }, loopInterval * 1000);
        
        return () => clearInterval(loopMusic);
      } catch (error) {
        console.error('Web Audio API is not supported in this browser', error);
      }
    };
    
    if (isPlaying && !isMuted) {
      // Запускаем музыку и получаем функцию очистки
      const cleanup = createTetrisTheme();
      
      // Возвращаем функцию очистки, которая будет вызвана при размонтировании компонента
      // или при изменении зависимостей (isPlaying, isMuted)
      return () => {
        // Очищаем интервал воспроизведения
        if (cleanup) cleanup();
        
        // Не закрываем контекст полностью, а только приостанавливаем его
        // чтобы при перезапуске игры можно было возобновить
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          audioContextRef.current.suspend().catch(console.error);
          console.log("Audio context suspended, not closed");
        }
      };
    } else if (!isPlaying && audioContextRef.current) {
      // Если игра остановлена, приостанавливаем аудио-контекст вместо закрытия
      audioContextRef.current.suspend().catch(console.error);
      console.log("Game stopped, suspending audio context");
    }
  }, [isPlaying, isMuted]);
  
  /**
   * Эффект для управления воспроизведением резервного аудио-элемента
   * Используется как запасной вариант, если Web Audio API недоступен
   */
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(error => {
          console.log("Audio play error:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);
  
  /**
   * Эффект для установки громкости резервного аудио-элемента
   * Выполняется один раз при монтировании компонента
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // 30% громкости
    }
  }, []);
  
  /**
   * Переключает режим без звука
   * 
   * Изменяет состояние mute и приостанавливает/возобновляет воспроизведение
   * в зависимости от текущего состояния.
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Управление Web Audio API контекстом в зависимости от состояния звука
    if (!isMuted && audioContextRef.current) {
      audioContextRef.current.suspend(); // Приостановить аудио при включении режима без звука
    } else if (isMuted && audioContextRef.current) {
      audioContextRef.current.resume();  // Возобновить аудио при выключении режима без звука
    }
  };
  
  return (
    <div className="absolute top-4 right-4 z-10">
      <button 
        onClick={toggleMute}
        className="w-10 h-10 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all"
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        )}
      </button>
      
      {/* 
        Обычно здесь мы бы подключили mp3-файл:
        <audio 
          ref={audioRef}
          loop
          preload="auto"
          style={{ display: 'none' }}
        >
          <source src="/music/tetris-theme.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        
        Но поскольку у нас нет реального аудиофайла, мы используем синтезируемую музыку через Web Audio API:
      */}
      
      <audio 
        ref={audioRef}
        loop
        preload="auto"
        src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAJrQC2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2trb///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAVJkgAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
        style={{ display: 'none' }}
      />
      
    </div>
  );
}