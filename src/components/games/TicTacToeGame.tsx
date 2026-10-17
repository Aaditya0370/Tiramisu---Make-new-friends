import { useState, useEffect } from 'react'
import { RotateCcw, Bot, User, Sparkles } from 'lucide-react'

type Square = 'X' | 'O' | null
type Difficulty = 'easy' | 'medium' | 'unbeatable'

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
]

export function TicTacToeGame() {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null)
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [scores, setScores] = useState({ player: 0, bot: 0, ties: 0 })

  function checkWin(currentBoard: Square[]): { winner: 'X' | 'O' | null; line: number[] | null } {
    for (const line of WINNING_COMBOS) {
      const [a, b, c] = line
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line }
      }
    }
    return { winner: null, line: null }
  }

  // Minimax algorithm for unbeatable difficulty
  function minimax(currentBoard: Square[], depth: number, isMaximizing: boolean): number {
    const { winner } = checkWin(currentBoard)
    if (winner === 'O') return 10 - depth
    if (winner === 'X') return depth - 10
    if (currentBoard.every(sq => sq !== null)) return 0

    if (isMaximizing) {
      let maxEval = -Infinity
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'O'
          const evaluation = minimax(currentBoard, depth + 1, false)
          currentBoard[i] = null
          maxEval = Math.max(maxEval, evaluation)
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'X'
          const evaluation = minimax(currentBoard, depth + 1, true)
          currentBoard[i] = null
          minEval = Math.min(minEval, evaluation)
        }
      }
      return minEval
    }
  }

  function getBestBotMove(currentBoard: Square[], diff: Difficulty): number {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null)

    if (emptyIndices.length === 0) return -1

    if (diff === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
    }

    if (diff === 'medium') {
      // 1. Can Bot win right now?
      for (const idx of emptyIndices) {
        currentBoard[idx] = 'O'
        if (checkWin(currentBoard).winner === 'O') {
          currentBoard[idx] = null
          return idx
        }
        currentBoard[idx] = null
      }
      // 2. Can Player win next turn? Block them!
      for (const idx of emptyIndices) {
        currentBoard[idx] = 'X'
        if (checkWin(currentBoard).winner === 'X') {
          currentBoard[idx] = null
          return idx
        }
        currentBoard[idx] = null
      }
      // 3. Take center if available
      if (currentBoard[4] === null && Math.random() > 0.3) return 4

      // Otherwise pick random
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
    }

    // Unbeatable: Minimax
    let bestScore = -Infinity
    let bestMove = emptyIndices[0]

    for (const idx of emptyIndices) {
      currentBoard[idx] = 'O'
      const score = minimax(currentBoard, 0, false)
      currentBoard[idx] = null
      if (score > bestScore) {
        bestScore = score
        bestMove = idx
      }
    }
    return bestMove
  }

  // Handle player clicking a square
  function handleSquareClick(index: number) {
    if (board[index] || !isPlayerTurn || winner || isBotThinking) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    const winCheck = checkWin(newBoard)
    if (winCheck.winner) {
      setWinner('X')
      setWinningLine(winCheck.line)
      setScores(s => ({ ...s, player: s.player + 1 }))
      return
    }

    if (newBoard.every(sq => sq !== null)) {
      setWinner('draw')
      setScores(s => ({ ...s, ties: s.ties + 1 }))
      return
    }

    setIsPlayerTurn(false)
  }

  // Bot move effect
  useEffect(() => {
    if (isPlayerTurn || winner) return

    setIsBotThinking(true)
    const timer = setTimeout(() => {
      const move = getBestBotMove([...board], difficulty)
      if (move !== -1) {
        const newBoard = [...board]
        newBoard[move] = 'O'
        setBoard(newBoard)

        const winCheck = checkWin(newBoard)
        if (winCheck.winner) {
          setWinner('O')
          setWinningLine(winCheck.line)
          setScores(s => ({ ...s, bot: s.bot + 1 }))
        } else if (newBoard.every(sq => sq !== null)) {
          setWinner('draw')
          setScores(s => ({ ...s, ties: s.ties + 1 }))
        } else {
          setIsPlayerTurn(true)
        }
      }
      setIsBotThinking(false)
    }, 450)

    return () => clearTimeout(timer)
  }, [isPlayerTurn, winner, board, difficulty])

  function resetGame() {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setWinner(null)
    setWinningLine(null)
    setIsBotThinking(false)
  }

  return (
    <div className="tictactoe-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#fcfaf7',
          border: '1px solid #C4A484',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: '#654321', fontSize: '15px' }}>Tic-Tac-Toe vs Bot</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            style={{
              padding: '6px 10px',
              border: '1px solid #C4A484',
              background: '#ffffff',
              color: '#654321',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="easy">Easy Bot</option>
            <option value="medium">Medium Bot</option>
            <option value="unbeatable">Unbeatable Bot</option>
          </select>

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
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Turn Banner */}
      <div
        style={{
          textAlign: 'center',
          padding: '12px',
          background: winner ? '#fff2ea' : '#ffffff',
          border: '1px solid #C4A484',
          marginBottom: '20px',
        }}
      >
        {winner === 'X' && (
          <strong style={{ color: '#2b7a4b', fontSize: '15px' }}>🎉 You won! Great move!</strong>
        )}
        {winner === 'O' && (
          <strong style={{ color: '#a33b1e', fontSize: '15px' }}>🤖 Bot wins this round!</strong>
        )}
        {winner === 'draw' && (
          <strong style={{ color: '#654321', fontSize: '15px' }}>🤝 It's a draw!</strong>
        )}
        {!winner && (
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#654321' }}>
            {isBotThinking ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="radar-spin" /> Bot is thinking (O)…
              </span>
            ) : isPlayerTurn ? (
              'Your turn (X)'
            ) : (
              'Bot turn (O)'
            )}
          </span>
        )}
      </div>

      {/* 3x3 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          background: '#654321',
          padding: '8px',
          boxShadow: '0 8px 24px rgba(101, 67, 33, 0.12)',
          aspectRatio: '1 / 1',
        }}
      >
        {board.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index)
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSquareClick(index)}
              style={{
                background: isWinningCell ? '#ffea88' : '#fcfaf7',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(36px, 10vw, 56px)',
                fontWeight: 900,
                color: cell === 'X' ? '#a33b1e' : '#654321',
                cursor: !cell && isPlayerTurn && !winner ? 'pointer' : 'default',
                transition: 'background 0.15s ease',
              }}
            >
              {cell}
            </button>
          )
        })}
      </div>

      {/* Scoreboard */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '20px',
          padding: '12px',
          background: '#fcfaf7',
          border: '1px solid #C4A484',
          fontSize: '13px',
          fontWeight: 700,
          color: '#654321',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} /> You: <strong>{scores.player}</strong>
        </div>
        <div>
          Ties: <strong>{scores.ties}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bot size={15} /> Bot: <strong>{scores.bot}</strong>
        </div>
      </div>
    </div>
  )
}
