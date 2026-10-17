import { useState } from 'react'
import {
  Gamepad2,
  HelpCircle,
  Zap,
  Grid3X3,
  Shield,
  Bot,
  User,
  Sparkles,
} from 'lucide-react'
import { ChessGame } from '../components/games/ChessGame'
import { TicTacToeGame } from '../components/games/TicTacToeGame'
import { MathQuizGame } from '../components/games/MathQuizGame'
import { TwentyQuestionsGame } from '../components/games/TwentyQuestionsGame'

type GameTab = 'chess' | 'tictactoe' | 'math' | 'twenty'

interface GameInfo {
  id: GameTab
  title: string
  subtitle: string
  icon: typeof Shield
  description: string
  difficulty: string
}

const GAMES: GameInfo[] = [
  {
    id: 'chess',
    title: 'Chess',
    subtitle: 'Classic 8x8 vs Bot',
    icon: Shield,
    description: 'Play White against a strategic Bot. Supports valid piece movements, promotions, and difficulty levels.',
    difficulty: 'Casual · Club · Master',
  },
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    subtitle: 'Fast 3x3 Match',
    icon: Grid3X3,
    description: 'Quick tactical match against Bot. Features smart Minimax algorithm with Easy, Medium, or Unbeatable modes.',
    difficulty: 'Easy · Medium · Unbeatable',
  },
  {
    id: 'math',
    title: 'Maths Quiz',
    subtitle: 'Random & Exact Math',
    icon: Zap,
    description: 'Dynamically generated random arithmetic, sequences, and PEMDAS challenges with verified exact solutions.',
    difficulty: 'Vs Bot Race · 60s Blitz',
  },
  {
    id: 'twenty',
    title: '20 Questions',
    subtitle: 'Deduction vs Bot',
    icon: HelpCircle,
    description: 'Bot picks a secret animal, object, or food. Ask up to 20 strategic yes/no questions to deduce the answer.',
    difficulty: '20 Questions Limit',
  },
]

export function JoyPage() {
  const [activeTab, setActiveTab] = useState<GameTab>('chess')

  const currentGame = GAMES.find(g => g.id === activeTab) || GAMES[0]

  return (
    <div
      className="joy-mode-container"
      style={{
        background: '#ffffff',
        minHeight: '100%',
        padding: '28px 24px 64px',
      }}
    >
      {/* Top Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Gamepad2 size={24} style={{ color: '#654321' }} />
          <h1
            style={{
              color: '#654321',
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Joy Room Arcade
          </h1>
        </div>
        <p style={{ margin: '4px 0 0', color: '#82664c', fontSize: '14px' }}>
          Play friendly games against a bot companion. Chess, Tic-Tac-Toe, Maths Quiz, and 20 Questions.
        </p>
      </div>

      {/* 4 Game Selector Cards (Strictly Non-Curved Rectangles) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {GAMES.map((game) => {
          const Icon = game.icon
          const isActive = activeTab === game.id

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => setActiveTab(game.id)}
              style={{
                background: isActive ? '#654321' : '#ffffff',
                border: isActive ? '2px solid #654321' : '1px solid #C4A484',
                color: isActive ? '#ffffff' : '#654321',
                padding: '16px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '110px',
                transition: 'all 0.15s ease',
                borderRadius: 0,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#ffffff' : '#654321' }} />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      opacity: 0.85,
                    }}
                  >
                    vs Bot
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '16px', fontWeight: 800 }}>
                  {game.title}
                </strong>
                <span
                  style={{
                    fontSize: '12px',
                    color: isActive ? '#ebd9c8' : '#82664c',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  {game.subtitle}
                </span>
              </div>

              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  marginTop: '10px',
                  color: isActive ? '#ffeedd' : '#82664c',
                }}
              >
                {game.difficulty}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Game Stage Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #C4A484',
          borderRadius: 0,
          padding: '24px 20px',
          boxShadow: '0 4px 20px rgba(101, 67, 33, 0.05)',
        }}
      >
        {activeTab === 'chess' && <ChessGame />}
        {activeTab === 'tictactoe' && <TicTacToeGame />}
        {activeTab === 'math' && <MathQuizGame />}
        {activeTab === 'twenty' && <TwentyQuestionsGame />}
      </div>
    </div>
  )
}
