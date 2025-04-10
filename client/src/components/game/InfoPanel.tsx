import React, { useState } from 'react';
import NextPiece from './NextPiece';
import Controls from './Controls';
import { Tetromino } from '@/lib/tetris';

// Импортируем иконки
import { 
  Star, 
  Rocket, 
  Sparkles, 
  Crown, 
  Globe, // Заменяем Planet на Globe
  Zap, 
  MoveDown, 
  Trophy, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

// Определяем тип для достижения
interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  icon: string;
}

// Функция для отображения иконки по названию
const AchievementIcon = ({ iconName, size = 20 }: { iconName: string, size?: number }) => {
  switch (iconName) {
    case 'star': return <Star size={size} className="text-yellow-400" />;
    case 'rocket': return <Rocket size={size} className="text-blue-400" />;
    case 'sweeper': return <Sparkles size={size} className="text-purple-400" />;
    case 'crown': return <Crown size={size} className="text-yellow-500" />;
    case 'planet': return <Globe size={size} className="text-indigo-400" />;
    case 'lightning': return <Zap size={size} className="text-cyan-400" />;
    case 'arrow-down': return <MoveDown size={size} className="text-green-400" />;
    default: return <Trophy size={size} className="text-yellow-400" />;
  }
};

interface InfoPanelProps {
  score: number;
  level: number;
  lines: number;
  highScore: number;
  nextPiece: Tetromino | null;
  isGameActive: boolean;
  isPaused: boolean;
  togglePause: () => void;
  restartGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotate: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  // Новые свойства для достижений
  galaxyPoints?: number;
  achievements?: Achievement[];
}

export default function InfoPanel({
  score,
  level,
  lines,
  highScore,
  nextPiece,
  isGameActive,
  isPaused,
  togglePause,
  restartGame,
  moveLeft,
  moveRight,
  rotate,
  softDrop,
  hardDrop,
  galaxyPoints = 0,
  achievements = []
}: InfoPanelProps) {
  // Состояние для отображения списка достижений
  const [showAchievements, setShowAchievements] = useState(false);

  // Подсчет разблокированных и заблокированных достижений
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const lockedAchievements = achievements.length - unlockedAchievements;

  return (
    <div className="w-full md:w-auto flex flex-col gap-6">
      {/* Score Section */}
      <div className="bg-tetris-bg bg-opacity-70 border-2 border-tetris-border rounded-md p-4 w-full" style={{
        boxShadow: '0 0 15px rgba(100, 200, 255, 0.2), inset 0 0 10px rgba(100, 200, 255, 0.1)',
      }}>
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300 bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">SCORE</h3>
            <p id="score" className="font-game text-2xl">{score}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300 bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">LEVEL</h3>
            <p id="level" className="font-game text-2xl">{level}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300 bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">LINES</h3>
            <p id="lines" className="font-game text-2xl">{lines}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300 bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">HIGH SCORE</h3>
            <p id="high-score" className="font-game text-2xl">{highScore}</p>
          </div>
          
          {/* Galaxy Points Section */}
          <div className="space-y-1 mt-2">
            <h3 className="font-game text-sm bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text flex items-center gap-1">
              <Globe size={16} className="text-purple-400" />
              <span>GALAXY POINTS</span>
            </h3>
            <p id="galaxy-points" className="font-game text-2xl bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">{galaxyPoints}</p>
          </div>
        </div>
      </div>
      
      {/* Achievements Section */}
      <div className="bg-tetris-bg bg-opacity-70 border-2 border-tetris-border rounded-md p-4" style={{
        boxShadow: '0 0 15px rgba(100, 200, 255, 0.2), inset 0 0 10px rgba(100, 200, 255, 0.1)',
      }}>
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => setShowAchievements(!showAchievements)}
        >
          <h3 className="font-game text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text flex items-center gap-1">
            <Trophy size={16} className="text-yellow-400" />
            <span>ДОСТИЖЕНИЯ</span>
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-200">{unlockedAchievements}/{achievements.length}</span>
            {showAchievements ? 
              <ChevronDown size={16} className="text-gray-300" /> : 
              <ChevronRight size={16} className="text-gray-300" />
            }
          </div>
        </div>
        
        {/* Список достижений */}
        {showAchievements && (
          <div className="mt-3 space-y-3 max-h-48 overflow-y-auto pr-1">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`flex items-start gap-2 p-2 rounded-md transition-all ${
                  achievement.unlocked 
                    ? 'bg-gray-800 bg-opacity-50' 
                    : 'bg-gray-900 bg-opacity-50 opacity-60'
                }`}
              >
                <div className="mt-0.5">
                  <AchievementIcon iconName={achievement.icon} size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-medium ${
                      achievement.unlocked ? 'text-white' : 'text-gray-400'
                    }`}>
                      {achievement.name}
                    </h4>
                    <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text font-bold">
                      +{achievement.points}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Next Piece Preview */}
      <div className="bg-tetris-bg bg-opacity-70 border-2 border-tetris-border rounded-md p-4" style={{
        boxShadow: '0 0 15px rgba(100, 200, 255, 0.2), inset 0 0 10px rgba(100, 200, 255, 0.1)',
      }}>
        <h3 className="font-game text-sm bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text mb-2">NEXT</h3>
        <NextPiece nextPiece={nextPiece} />
      </div>
      
      {/* Game Controls */}
      <Controls 
        isGameActive={isGameActive}
        isPaused={isPaused}
        togglePause={togglePause}
        restartGame={restartGame}
        moveLeft={moveLeft}
        moveRight={moveRight}
        rotate={rotate}
        softDrop={softDrop}
        hardDrop={hardDrop}
      />
    </div>
  );
}
