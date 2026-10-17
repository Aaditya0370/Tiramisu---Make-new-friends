import { useState, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Zap,
  Award,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy,
} from 'lucide-react'

interface Question {
  expression: string
  answer: number
  category: string
  explanation: string
  options: number[]
}

// Generate an extremely random but guaranteed mathematically correct question
function generateQuestion(): Question {
  const types = ['add_sub', 'mult_div', 'pemdas', 'sequence', 'algebra']
  const chosenType = types[Math.floor(Math.random() * types.length)]

  let expression = ''
  let answer = 0
  let category = 'Arithmetic'
  let explanation = ''

  if (chosenType === 'add_sub') {
    const isAdd = Math.random() > 0.5
    if (isAdd) {
      const a = Math.floor(Math.random() * 450) + 35
      const b = Math.floor(Math.random() * 450) + 35
      expression = `${a} + ${b}`
      answer = a + b
      category = 'Addition'
      explanation = `${a} + ${b} = ${answer}`
    } else {
      const a = Math.floor(Math.random() * 600) + 100
      const b = Math.floor(Math.random() * (a - 20)) + 15
      expression = `${a} - ${b}`
      answer = a - b
      category = 'Subtraction'
      explanation = `${a} - ${b} = ${answer}`
    }
  } else if (chosenType === 'mult_div') {
    const isMult = Math.random() > 0.4
    if (isMult) {
      const a = Math.floor(Math.random() * 24) + 6
      const b = Math.floor(Math.random() * 19) + 4
      expression = `${a} × ${b}`
      answer = a * b
      category = 'Multiplication'
      explanation = `${a} × ${b} = ${answer}`
    } else {
      // Clean integer division
      const divisor = Math.floor(Math.random() * 15) + 3
      const quotient = Math.floor(Math.random() * 25) + 4
      const dividend = divisor * quotient
      expression = `${dividend} ÷ ${divisor}`
      answer = quotient
      category = 'Division'
      explanation = `${dividend} ÷ ${divisor} = ${quotient} (because ${divisor} × ${quotient} = ${dividend})`
    }
  } else if (chosenType === 'pemdas') {
    const variant = Math.floor(Math.random() * 3)
    if (variant === 0) {
      const a = Math.floor(Math.random() * 30) + 5
      const b = Math.floor(Math.random() * 12) + 3
      const c = Math.floor(Math.random() * 9) + 2
      expression = `${a} + (${b} × ${c})`
      answer = a + b * c
      category = 'Order of Operations'
      explanation = `First multiply: ${b} × ${c} = ${b * c}, then add: ${a} + ${b * c} = ${answer}`
    } else if (variant === 1) {
      const b = Math.floor(Math.random() * 8) + 2
      const q = Math.floor(Math.random() * 12) + 3
      const total = b * q
      const a = Math.floor(Math.random() * 50) + total + 10
      expression = `${a} - (${total} ÷ ${b})`
      answer = a - q
      category = 'Order of Operations'
      explanation = `First divide: ${total} ÷ ${b} = ${q}, then subtract: ${a} - ${q} = ${answer}`
    } else {
      const a = Math.floor(Math.random() * 12) + 3
      const b = Math.floor(Math.random() * 8) + 2
      const c = Math.floor(Math.random() * 20) + 1
      expression = `(${a} × ${b}) - ${c}`
      answer = a * b - c
      category = 'Order of Operations'
      explanation = `First multiply: ${a} × ${b} = ${a * b}, then subtract: ${a * b} - ${c} = ${answer}`
    }
  } else if (chosenType === 'sequence') {
    const isGeometric = Math.random() > 0.7
    if (isGeometric) {
      const start = Math.floor(Math.random() * 5) + 2
      const ratio = Math.floor(Math.random() * 2) + 2 // 2 or 3
      const s0 = start
      const s1 = s0 * ratio
      const s2 = s1 * ratio
      const s3 = s2 * ratio
      expression = `${s0}, ${s1}, ${s2}, ${s3}, ?`
      answer = s3 * ratio
      category = 'Geometric Pattern'
      explanation = `Each number multiplies by ${ratio}: ${s3} × ${ratio} = ${answer}`
    } else {
      const start = Math.floor(Math.random() * 40) + 5
      const step = Math.floor(Math.random() * 14) + 3
      const s0 = start
      const s1 = s0 + step
      const s2 = s1 + step
      const s3 = s2 + step
      expression = `${s0}, ${s1}, ${s2}, ${s3}, ?`
      answer = s3 + step
      category = 'Sequence Pattern'
      explanation = `The sequence adds +${step} each step: ${s3} + ${step} = ${answer}`
    }
  } else {
    // Quick Algebra: ax + b = c
    const x = Math.floor(Math.random() * 15) + 2
    const a = Math.floor(Math.random() * 7) + 2
    const b = Math.floor(Math.random() * 25) + 3
    const c = a * x + b
    expression = `${a}x + ${b} = ${c},  find x`
    answer = x
    category = 'Fast Algebra'
    explanation = `${a}x = ${c} - ${b} = ${c - b}, therefore x = ${c - b} ÷ ${a} = ${x}`
  }

  // Generate 3 unique distractors close to the answer
  const distractors = new Set<number>()
  const offsets = [-10, 10, -1, 1, -2, 2, -5, 5, -15, 15]

  while (distractors.size < 3) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)]
    const fake = answer + offset
    if (fake !== answer && !distractors.has(fake)) {
      distractors.add(fake)
    }
  }

  const options = [answer, ...Array.from(distractors)]
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  return { expression, answer, category, explanation, options }
}

export function MathQuizGame() {
  const [currentQ, setCurrentQ] = useState<Question>(generateQuestion)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null)

  // Game Mode: 'vs-bot' (race to 10 points) or 'blitz' (60s timer)
  const [gameMode, setGameMode] = useState<'vs-bot' | 'blitz'>('vs-bot')

  // Scores
  const [playerScore, setPlayerScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null)

  // Timer for blitz
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Bot thinking status
  const [botStatus, setBotStatus] = useState<string>('Bot is solving…')

  // Blitz countdown timer
  useEffect(() => {
    if (gameMode !== 'blitz' || !isTimerRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          setWinnerMessage(`Time's up! Final Score: ${playerScore}`)
          if (playerScore > highScore) setHighScore(playerScore)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameMode, isTimerRunning, timeLeft, playerScore, highScore])

  // Bot race timer in vs-bot mode
  useEffect(() => {
    if (gameMode !== 'vs-bot' || isAnswered || winnerMessage) return

    // Bot solves question in 3.5 - 6.5 seconds
    const botDelay = Math.floor(Math.random() * 3000) + 3500
    setBotStatus('Bot is calculating…')

    const timer = setTimeout(() => {
      if (isAnswered || winnerMessage) return

      // Bot has 82% accuracy
      const botCorrect = Math.random() < 0.82
      if (botCorrect) {
        setBotScore(b => {
          const next = b + 1
          if (next >= 10) {
            setWinnerMessage('Bot reached 10 points first! Rematch?')
          }
          return next
        })
        setBotStatus('Bot answered correctly!')
      } else {
        setBotStatus('Bot made a miscalculation!')
      }

      // Next question
      window.setTimeout(() => {
        if (winnerMessage) return
        setCurrentQ(generateQuestion())
        setSelectedOption(null)
        setIsAnswered(false)
        setCustomInput('')
        setLastResult(null)
      }, 1200)
    }, botDelay)

    return () => clearTimeout(timer)
  }, [currentQ, gameMode, isAnswered, winnerMessage])

  // Next question trigger
  const nextQuestion = useCallback(() => {
    setCurrentQ(generateQuestion())
    setSelectedOption(null)
    setIsAnswered(false)
    setCustomInput('')
    setLastResult(null)
  }, [])

  function handleSelectOption(option: number) {
    if (isAnswered || winnerMessage) return

    setSelectedOption(option)
    setIsAnswered(true)

    const isCorrect = option === currentQ.answer
    if (isCorrect) {
      setLastResult('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      const points = 100 * (newStreak > 3 ? 3 : newStreak > 1 ? 2 : 1)
      setPlayerScore(p => {
        const next = gameMode === 'vs-bot' ? p + 1 : p + points
        if (gameMode === 'vs-bot' && next >= 10) {
          setWinnerMessage('🎉 You defeated the Bot to 10 points!')
        }
        return next
      })
    } else {
      setLastResult('wrong')
      setStreak(0)
    }

    // Auto proceed to next question after 1.5 seconds
    window.setTimeout(() => {
      if (!winnerMessage) nextQuestion()
    }, 1600)
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customInput.trim()) return
    const num = parseFloat(customInput.trim())
    if (!isNaN(num)) {
      handleSelectOption(num)
    }
  }

  function resetGame() {
    setPlayerScore(0)
    setBotScore(0)
    setStreak(0)
    setTimeLeft(60)
    setIsTimerRunning(gameMode === 'blitz')
    setWinnerMessage(null)
    setLastResult(null)
    nextQuestion()
  }

  return (
    <div className="mathquiz-container" style={{ maxWidth: '580px', margin: '0 auto' }}>
      {/* Game Mode Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          padding: '12px 18px',
          background: '#fcfaf7',
          border: '1px solid #C4A484',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: '#654321' }} />
          <strong style={{ color: '#654321', fontSize: '15px' }}>Maths Quiz (Exact & Random)</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setGameMode('vs-bot')
              resetGame()
            }}
            style={{
              padding: '6px 12px',
              border: gameMode === 'vs-bot' ? '2px solid #654321' : '1px solid #C4A484',
              background: gameMode === 'vs-bot' ? '#654321' : '#ffffff',
              color: gameMode === 'vs-bot' ? '#ffffff' : '#654321',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Vs Bot (Race to 10)
          </button>

          <button
            type="button"
            onClick={() => {
              setGameMode('blitz')
              setIsTimerRunning(true)
              resetGame()
            }}
            style={{
              padding: '6px 12px',
              border: gameMode === 'blitz' ? '2px solid #654321' : '1px solid #C4A484',
              background: gameMode === 'blitz' ? '#654321' : '#ffffff',
              color: gameMode === 'blitz' ? '#ffffff' : '#654321',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            60s Blitz
          </button>

          <button
            type="button"
            onClick={resetGame}
            title="Reset Game"
            style={{
              padding: '6px 10px',
              border: '1px solid #C4A484',
              background: '#ffffff',
              color: '#654321',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Match Scores */}
      {gameMode === 'vs-bot' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            padding: '12px 18px',
            background: '#ffffff',
            border: '1px solid #C4A484',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: '#654321' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#654321' }}>You</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#2b7a4b' }}>
                {playerScore} <span style={{ fontSize: '12px', color: '#82664c' }}>/ 10</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#82664c', fontStyle: 'italic' }}>
            {botStatus}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#654321' }}>Bot</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#a33b1e' }}>
                {botScore} <span style={{ fontSize: '12px', color: '#82664c' }}>/ 10</span>
              </div>
            </div>
            <Bot size={16} style={{ color: '#654321' }} />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '12px 18px',
            background: '#ffffff',
            border: '1px solid #C4A484',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Timer size={16} style={{ color: timeLeft <= 10 ? '#a33b1e' : '#654321' }} />
            <strong
              style={{
                fontSize: '18px',
                color: timeLeft <= 10 ? '#a33b1e' : '#654321',
              }}
            >
              {timeLeft}s
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} style={{ color: '#654321' }} />
            <span style={{ fontSize: '13px', color: '#82664c' }}>Score:</span>
            <strong style={{ fontSize: '16px', color: '#654321' }}>{playerScore}</strong>
            {streak > 1 && (
              <span
                style={{
                  fontSize: '11px',
                  background: '#654321',
                  color: '#ffffff',
                  padding: '2px 6px',
                  fontWeight: 800,
                  marginLeft: '4px',
                }}
              >
                {streak}x Streak!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Winner Modal Banner */}
      {winnerMessage && (
        <div
          style={{
            padding: '20px',
            background: '#fff2ea',
            border: '2px solid #a33b1e',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: '0 0 10px', color: '#a33b1e', fontSize: '18px', fontWeight: 800 }}>
            {winnerMessage}
          </h3>
          <button
            type="button"
            onClick={resetGame}
            style={{
              padding: '8px 18px',
              background: '#654321',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Question Card */}
      <div
        style={{
          background: '#ffffff',
          border: '2px solid #654321',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(101, 67, 33, 0.08)',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#82664c',
            border: '1px solid #C4A484',
            padding: '3px 10px',
            marginBottom: '16px',
          }}
        >
          {currentQ.category}
        </span>

        <h2
          style={{
            fontSize: 'clamp(32px, 7vw, 48px)',
            fontWeight: 900,
            color: '#654321',
            margin: '0 0 24px',
            letterSpacing: '-0.02em',
          }}
        >
          {currentQ.expression}
        </h2>

        {/* 4 Multi-Choice Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            maxWidth: '440px',
            margin: '0 auto 20px',
          }}
        >
          {currentQ.options.map((opt, idx) => {
            let bg = '#fcfaf7'
            let border = '1px solid #C4A484'
            let color = '#654321'

            if (isAnswered) {
              if (opt === currentQ.answer) {
                bg = '#eaf5ee'
                border = '2px solid #2b7a4b'
                color = '#2b7a4b'
              } else if (opt === selectedOption) {
                bg = '#fbeeed'
                border = '2px solid #a33b1e'
                color = '#a33b1e'
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered || !!winnerMessage}
                style={{
                  background: bg,
                  border,
                  color,
                  padding: '16px 12px',
                  fontSize: '22px',
                  fontWeight: 800,
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  borderRadius: 0,
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {/* Or direct typing input */}
        <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
          <input
            type="number"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isAnswered || !!winnerMessage}
            placeholder="Or type answer…"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #C4A484',
              color: '#654321',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isAnswered || !customInput.trim() || !!winnerMessage}
            style={{
              padding: '10px 16px',
              background: '#654321',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isAnswered || !customInput.trim() ? 'default' : 'pointer',
            }}
          >
            Submit
          </button>
        </form>

        {/* Step-by-Step explanation breakdown on answer */}
        {isAnswered && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: lastResult === 'correct' ? '#eaf5ee' : '#fff2ea',
              border: `1px solid ${lastResult === 'correct' ? '#2b7a4b' : '#a33b1e'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            {lastResult === 'correct' ? (
              <CheckCircle2 size={18} style={{ color: '#2b7a4b', flexShrink: 0 }} />
            ) : (
              <XCircle size={18} style={{ color: '#a33b1e', flexShrink: 0 }} />
            )}
            <div style={{ textAlign: 'left', fontSize: '13px', color: '#654321' }}>
              <strong>{lastResult === 'correct' ? 'Exact Solution:' : 'Correct Answer:'}</strong>{' '}
              {currentQ.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
