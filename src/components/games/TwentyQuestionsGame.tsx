import { useState } from 'react'
import { HelpCircle, RotateCcw, Bot, User, CheckCircle, XCircle, Send, Sparkles } from 'lucide-react'

interface SecretEntity {
  name: string
  category: string
  hints: Record<string, boolean>
  funFact: string
}

const ENTITIES: SecretEntity[] = [
  {
    name: 'Penguin',
    category: 'Animal',
    hints: {
      living: true,
      fly: false,
      swim: true,
      mammal: false,
      edible: false,
      manmade: false,
      home: false,
      electricity: false,
      sound: true,
      largerThanPerson: false,
      water: true,
      fur: false,
    },
    funFact: 'Penguins are flightless marine birds known for their tuxedo-like plumage and torpedo swimming.',
  },
  {
    name: 'Bicycle',
    category: 'Object',
    hints: {
      living: false,
      fly: false,
      swim: false,
      mammal: false,
      edible: false,
      manmade: true,
      home: true,
      electricity: false,
      sound: true,
      largerThanPerson: false,
      water: false,
      fur: false,
    },
    funFact: 'The modern pedal bicycle was developed in the 19th century and is one of humanity’s most energy-efficient vehicles.',
  },
  {
    name: 'Pizza',
    category: 'Food',
    hints: {
      living: false,
      fly: false,
      swim: false,
      mammal: false,
      edible: true,
      manmade: true,
      home: true,
      electricity: false,
      sound: false,
      largerThanPerson: false,
      water: false,
      fur: false,
    },
    funFact: 'Originating in Naples, pizza is one of the world’s most shared social comfort foods.',
  },
  {
    name: 'Dolphin',
    category: 'Animal',
    hints: {
      living: true,
      fly: false,
      swim: true,
      mammal: true,
      edible: false,
      manmade: false,
      home: false,
      electricity: false,
      sound: true,
      largerThanPerson: true,
      water: true,
      fur: false,
    },
    funFact: 'Dolphins communicate using unique signature whistles that function almost like personal names.',
  },
  {
    name: 'Headphones',
    category: 'Object',
    hints: {
      living: false,
      fly: false,
      swim: false,
      mammal: false,
      edible: false,
      manmade: true,
      home: true,
      electricity: true,
      sound: true,
      largerThanPerson: false,
      water: false,
      fur: false,
    },
    funFact: 'Headphones convert electrical signals into sound waves directly beside your eardrum.',
  },
  {
    name: 'Croissant',
    category: 'Food',
    hints: {
      living: false,
      fly: false,
      swim: false,
      mammal: false,
      edible: true,
      manmade: true,
      home: true,
      electricity: false,
      sound: false,
      largerThanPerson: false,
      water: false,
      fur: false,
    },
    funFact: 'A proper French laminated croissant features dozens of alternating micro-layers of butter and dough.',
  },
  {
    name: 'Eagle',
    category: 'Animal',
    hints: {
      living: true,
      fly: true,
      swim: false,
      mammal: false,
      edible: false,
      manmade: false,
      home: false,
      electricity: false,
      sound: true,
      largerThanPerson: false,
      water: false,
      fur: false,
    },
    funFact: 'Eagles possess remarkable eyesight up to 4 to 8 times stronger than an average human.',
  },
  {
    name: 'Guitar',
    category: 'Object',
    hints: {
      living: false,
      fly: false,
      swim: false,
      mammal: false,
      edible: false,
      manmade: true,
      home: true,
      electricity: false,
      sound: true,
      largerThanPerson: false,
      water: false,
      fur: false,
    },
    funFact: 'Six vibrating strings over a resonant acoustic soundboard or magnetic pickups.',
  },
  {
    name: 'Kangaroo',
    category: 'Animal',
    hints: {
      living: true,
      fly: false,
      swim: false,
      mammal: true,
      edible: false,
      manmade: false,
      home: false,
      electricity: false,
      sound: true,
      largerThanPerson: true,
      water: false,
      fur: true,
    },
    funFact: 'Kangaroos use their large muscular tails for balance while hopping at speeds up to 40 mph.',
  },
  {
    name: 'Coffee',
    category: 'Food',
    hints: {
      living: false,
      fly: false,
      swim: false,
      mammal: false,
      edible: true,
      manmade: true,
      home: true,
      electricity: false,
      sound: false,
      largerThanPerson: false,
      water: true,
      fur: false,
    },
    funFact: 'Brewed from roasted Coffea berries, it fuels millions of morning conversations worldwide.',
  },
]

const STANDARD_QUESTIONS: { key: string; text: string }[] = [
  { key: 'living', text: 'Is it a living thing?' },
  { key: 'manmade', text: 'Is it man-made?' },
  { key: 'edible', text: 'Can you eat or drink it?' },
  { key: 'fly', text: 'Can it fly?' },
  { key: 'swim', text: 'Can it swim or live in water?' },
  { key: 'mammal', text: 'Is it a mammal?' },
  { key: 'electricity', text: 'Does it run on electricity?' },
  { key: 'home', text: 'Is it commonly found in a home?' },
  { key: 'sound', text: 'Does it make audible sound?' },
  { key: 'largerThanPerson', text: 'Is it typically larger than a human?' },
  { key: 'fur', text: 'Does it have fur?' },
]

export function TwentyQuestionsGame() {
  const [secretIndex, setSecretIndex] = useState(() => Math.floor(Math.random() * ENTITIES.length))
  const [history, setHistory] = useState<{ q: string; a: 'YES' | 'NO' | 'MAYBE'; note?: string }[]>([])
  const [customGuess, setCustomGuess] = useState('')
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null)

  const secret = ENTITIES[secretIndex]
  const questionCount = history.length
  const questionsLeft = Math.max(0, 20 - questionCount)

  function askStandardQuestion(key: string, text: string) {
    if (gameState !== 'playing' || questionsLeft <= 0) return

    // Avoid duplicate question
    if (history.some(h => h.q === text)) {
      setGuessFeedback('You already asked that question!')
      return
    }

    const answerBool = secret.hints[key]
    const answerStr = answerBool ? 'YES' : 'NO'

    setHistory(prev => [...prev, { q: text, a: answerStr }])
    setGuessFeedback(null)

    if (history.length + 1 >= 20) {
      setGameState('lost')
    }
  }

  function handleMakeGuess(e: React.FormEvent) {
    e.preventDefault()
    if (!customGuess.trim() || gameState !== 'playing') return

    const normalizedGuess = customGuess.trim().toLowerCase()
    const normalizedSecret = secret.name.toLowerCase()

    if (normalizedGuess === normalizedSecret || normalizedGuess.includes(normalizedSecret)) {
      setGameState('won')
      setGuessFeedback(`🎉 Correct! It was indeed the ${secret.name}!`)
    } else {
      const newCount = history.length + 1
      setHistory(prev => [
        ...prev,
        { q: `Is it a "${customGuess.trim()}"?`, a: 'NO', note: 'Not quite!' },
      ])
      setGuessFeedback(`No, it is not "${customGuess.trim()}". Keep asking or guessing!`)
      setCustomGuess('')

      if (newCount >= 20) {
        setGameState('lost')
      }
    }
  }

  function resetGame() {
    setSecretIndex(Math.floor(Math.random() * ENTITIES.length))
    setHistory([])
    setCustomGuess('')
    setGameState('playing')
    setGuessFeedback(null)
  }

  return (
    <div className="twenty-questions-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '12px 18px',
          background: '#fcfaf7',
          border: '1px solid #C4A484',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} style={{ color: '#654321' }} />
          <strong style={{ color: '#654321', fontSize: '15px' }}>20 Questions vs Bot</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: questionsLeft <= 5 ? '#a33b1e' : '#654321',
            }}
          >
            {questionsLeft} questions left
          </span>

          <button
            type="button"
            onClick={resetGame}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: '#654321',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>New Secret</span>
          </button>
        </div>
      </div>

      {/* Bot introduction banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #C4A484',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            background: '#654321',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bot size={22} />
        </div>
        <div style={{ fontSize: '13px', color: '#654321', lineHeight: 1.45 }}>
          <strong>I have chosen a secret entity in my memory!</strong>
          <p style={{ margin: '4px 0 0', color: '#82664c' }}>
            Category: <em>{secret.category}</em>. Ask me yes/no questions below or type your guess at any time!
          </p>
        </div>
      </div>

      {/* Outcome Banner */}
      {gameState === 'won' && (
        <div
          style={{
            background: '#eaf5ee',
            border: '2px solid #2b7a4b',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#2b7a4b', margin: '0 0 8px', fontSize: '22px', fontWeight: 800 }}>
            🎉 You Guessed It! It was {secret.name}!
          </h2>
          <p style={{ color: '#2b7a4b', fontSize: '14px', margin: '0 0 16px' }}>
            You solved it in {questionCount} question{questionCount === 1 ? '' : 's'}!
          </p>
          <p style={{ color: '#654321', fontSize: '13px', margin: '0 0 16px', fontStyle: 'italic' }}>
            {secret.funFact}
          </p>
          <button
            type="button"
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              background: '#2b7a4b',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Play Next Round
          </button>
        </div>
      )}

      {gameState === 'lost' && (
        <div
          style={{
            background: '#fff2ea',
            border: '2px solid #a33b1e',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#a33b1e', margin: '0 0 8px', fontSize: '20px', fontWeight: 800 }}>
            20 Questions Expired!
          </h2>
          <p style={{ color: '#a33b1e', fontSize: '14px', margin: '0 0 8px' }}>
            The secret was: <strong>{secret.name}</strong> ({secret.category})
          </p>
          <p style={{ color: '#654321', fontSize: '13px', margin: '0 0 16px', fontStyle: 'italic' }}>
            {secret.funFact}
          </p>
          <button
            type="button"
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              background: '#654321',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Try Another Secret
          </button>
        </div>
      )}

      {/* Feedback banner */}
      {guessFeedback && gameState === 'playing' && (
        <div
          style={{
            padding: '10px 14px',
            background: guessFeedback.startsWith('No') ? '#fff2ea' : '#fcfaf7',
            border: '1px solid #C4A484',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#654321',
          }}
        >
          {guessFeedback}
        </div>
      )}

      {/* Direct Guess Input */}
      {gameState === 'playing' && (
        <form
          onSubmit={handleMakeGuess}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <input
            type="text"
            value={customGuess}
            onChange={(e) => setCustomGuess(e.target.value)}
            placeholder="Know the answer? Guess here (e.g. Penguin, Pizza)..."
            style={{
              flex: 1,
              padding: '12px 14px',
              border: '1px solid #C4A484',
              color: '#654321',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!customGuess.trim()}
            style={{
              padding: '12px 18px',
              background: '#654321',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: customGuess.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Guess</span>
            <Send size={14} />
          </button>
        </form>
      )}

      {/* Common Question Chips */}
      {gameState === 'playing' && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#82664c',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}
          >
            Select a question to ask the bot:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {STANDARD_QUESTIONS.map(({ key, text }) => {
              const asked = history.some(h => h.q === text)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => askStandardQuestion(key, text)}
                  disabled={asked}
                  style={{
                    padding: '8px 12px',
                    background: asked ? '#eee7df' : '#ffffff',
                    border: '1px solid #C4A484',
                    color: asked ? '#9c836d' : '#654321',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: asked ? 'default' : 'pointer',
                    textDecoration: asked ? 'line-through' : 'none',
                  }}
                >
                  {text}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* History Log */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #C4A484',
          padding: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            borderBottom: '1px solid #f0e6dc',
            paddingBottom: '8px',
          }}
        >
          <strong style={{ fontSize: '13px', color: '#654321' }}>Questions & Answers Log</strong>
          <span style={{ fontSize: '11px', color: '#82664c' }}>{history.length} / 20</span>
        </div>

        {history.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#82664c', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
            No questions asked yet. Pick a question above!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((entry, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#fcfaf7',
                  border: '1px solid #f2e7dc',
                }}
              >
                <div style={{ fontSize: '13px', color: '#654321' }}>
                  <span style={{ fontWeight: 700, marginRight: '6px', color: '#82664c' }}>
                    Q{idx + 1}:
                  </span>
                  {entry.q}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '12px',
                    padding: '2px 8px',
                    background: entry.a === 'YES' ? '#2b7a4b' : '#a33b1e',
                    color: '#ffffff',
                  }}
                >
                  {entry.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
