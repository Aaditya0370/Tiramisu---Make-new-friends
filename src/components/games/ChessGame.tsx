import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, Award, Shield, User, Bot, Sparkles } from 'lucide-react'

type PieceColor = 'w' | 'b'
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'

interface Piece {
  type: PieceType
  color: PieceColor
}

type Board = (Piece | null)[][]

const INITIAL_BOARD: Board = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
]

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

const PIECE_VALUES: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 1000,
}

export function ChessGame() {
  const [board, setBoard] = useState<Board>(() => INITIAL_BOARD.map(row => [...row]))
  const [turn, setTurn] = useState<PieceColor>('w')
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([])
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([])
  const [gameStatus, setGameStatus] = useState<string>('Your turn (White)')
  const [winner, setWinner] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<'casual' | 'club' | 'master'>('club')
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 })

  // Calculate legal moves for a piece at (r, c)
  const getMoves = useCallback((b: Board, r: number, c: number): [number, number][] => {
    const piece = b[r][c]
    if (!piece) return []
    const moves: [number, number][] = []
    const color = piece.color
    const opponent = color === 'w' ? 'b' : 'w'

    const isInside = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8

    if (piece.type === 'p') {
      const dir = color === 'w' ? -1 : 1
      const startRow = color === 'w' ? 6 : 1
      // One step forward
      if (isInside(r + dir, c) && !b[r + dir][c]) {
        moves.push([r + dir, c])
        // Two steps forward
        if (r === startRow && !b[r + 2 * dir][c]) {
          moves.push([r + 2 * dir, c])
        }
      }
      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nr = r + dir
        const nc = c + dc
        if (isInside(nr, nc) && b[nr][nc]?.color === opponent) {
          moves.push([nr, nc])
        }
      }
    } else if (piece.type === 'n') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ]
      for (const [dr, dc] of offsets) {
        const nr = r + dr
        const nc = c + dc
        if (isInside(nr, nc) && (!b[nr][nc] || b[nr][nc]?.color === opponent)) {
          moves.push([nr, nc])
        }
      }
    } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
      const directions: [number, number][] = []
      if (piece.type === 'b' || piece.type === 'q') {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1])
      }
      if (piece.type === 'r' || piece.type === 'q') {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1])
      }
      for (const [dr, dc] of directions) {
        let nr = r + dr
        let nc = c + dc
        while (isInside(nr, nc)) {
          if (!b[nr][nc]) {
            moves.push([nr, nc])
          } else {
            if (b[nr][nc]?.color === opponent) moves.push([nr, nc])
            break
          }
          nr += dr
          nc += dc
        }
      }
    } else if (piece.type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (isInside(nr, nc) && (!b[nr][nc] || b[nr][nc]?.color === opponent)) {
            moves.push([nr, nc])
          }
        }
      }
    }

    return moves
  }, [])

  // Check if a king was captured
  function checkGameOver(b: Board): string | null {
    let whiteKing = false
    let blackKing = false
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c]
        if (p?.type === 'k') {
          if (p.color === 'w') whiteKing = true
          if (p.color === 'b') blackKing = true
        }
      }
    }
    if (!whiteKing) return 'Bot wins!'
    if (!blackKing) return 'You win!'
    return null
  }

  // Handle player clicking a square
  function handleSquareClick(r: number, c: number) {
    if (turn !== 'w' || winner || isBotThinking) return

    const clickedPiece = board[r][c]

    // If already selected a piece and clicked on a valid move
    if (selectedSquare) {
      const [sr, sc] = selectedSquare
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c)

      if (isValid) {
        executeMove(sr, sc, r, c)
        return
      }
    }

    // Otherwise select the clicked white piece
    if (clickedPiece && clickedPiece.color === 'w') {
      setSelectedSquare([r, c])
      setValidMoves(getMoves(board, r, c))
    } else {
      setSelectedSquare(null)
      setValidMoves([])
    }
  }

  // Execute a move on the board
  function executeMove(fromR: number, fromC: number, toR: number, toC: number) {
    const movingPiece = board[fromR][fromC]
    if (!movingPiece) return

    const targetPiece = board[toR][toC]
    const newBoard = board.map(row => [...row])

    // Pawn promotion to Queen
    let finalPiece = movingPiece
    if (movingPiece.type === 'p' && (toR === 0 || toR === 7)) {
      finalPiece = { type: 'q', color: movingPiece.color }
    }

    newBoard[toR][toC] = finalPiece
    newBoard[fromR][fromC] = null

    // Track captures
    if (targetPiece) {
      if (movingPiece.color === 'w') {
        setCapturedByWhite(prev => [...prev, targetPiece])
      } else {
        setCapturedByBlack(prev => [...prev, targetPiece])
      }
    }

    setBoard(newBoard)
    setSelectedSquare(null)
    setValidMoves([])

    const result = checkGameOver(newBoard)
    if (result) {
      setWinner(result)
      setGameStatus(result)
      if (result.includes('You')) {
        setStats(s => ({ ...s, wins: s.wins + 1 }))
      } else {
        setStats(s => ({ ...s, losses: s.losses + 1 }))
      }
      return
    }

    const nextTurn = movingPiece.color === 'w' ? 'b' : 'w'
    setTurn(nextTurn)
    setGameStatus(nextTurn === 'w' ? 'Your turn (White)' : 'Bot is calculating move…')
  }

  // Bot logic
  useEffect(() => {
    if (turn !== 'b' || winner) return

    setIsBotThinking(true)
    const timer = setTimeout(() => {
      // Find all possible moves for Black
      const allMoves: { from: [number, number]; to: [number, number]; score: number }[] = []

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]?.color === 'b') {
            const moves = getMoves(board, r, c)
            for (const [toR, toC] of moves) {
              const target = board[toR][toC]
              let score = 0

              // Capture evaluation
              if (target) {
                score += PIECE_VALUES[target.type] * 2
              }

              // Center control
              if ((toR === 3 || toR === 4) && (toC === 3 || toC === 4)) {
                score += 3
              }

              // Pawn advancement
              if (board[r][c]?.type === 'p') {
                score += toR
              }

              allMoves.push({ from: [r, c], to: [toR, toC], score })
            }
          }
        }
      }

      if (allMoves.length === 0) {
        setWinner('Stalemate! No legal moves.')
        setGameStatus('Draw')
        setStats(s => ({ ...s, draws: s.draws + 1 }))
        setIsBotThinking(false)
        return
      }

      let chosenMove = allMoves[0]

      if (difficulty === 'casual') {
        // Casual picks random or simple capture
        const captures = allMoves.filter(m => m.score > 5)
        if (captures.length > 0 && Math.random() > 0.4) {
          chosenMove = captures[Math.floor(Math.random() * captures.length)]
        } else {
          chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)]
        }
      } else if (difficulty === 'club') {
        // Sort by score with a little variance
        allMoves.sort((a, b) => b.score - a.score)
        const topPool = allMoves.slice(0, Math.min(3, allMoves.length))
        chosenMove = topPool[Math.floor(Math.random() * topPool.length)]
      } else {
        // Master always picks the highest score
        allMoves.sort((a, b) => b.score - a.score)
        chosenMove = allMoves[0]
      }

      executeMove(chosenMove.from[0], chosenMove.from[1], chosenMove.to[0], chosenMove.to[1])
      setIsBotThinking(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [turn, winner, board, difficulty, getMoves])

  function resetGame() {
    setBoard(INITIAL_BOARD.map(row => [...row]))
    setTurn('w')
    setSelectedSquare(null)
    setValidMoves([])
    setCapturedByWhite([])
    setCapturedByBlack([])
    setWinner(null)
    setGameStatus('Your turn (White)')
    setIsBotThinking(false)
  }

  return (
    <div className="chess-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Game Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          padding: '14px 18px',
          background: '#fcfaf7',
          border: '1px solid #C4A484',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: '#654321' }} />
          <strong style={{ color: '#654321', fontSize: '15px' }}>Chess vs Bot</strong>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: '#ffffff',
              border: '1px solid #C4A484',
              color: '#82664c',
              fontWeight: 700,
            }}
          >
            {difficulty.toUpperCase()}
          </span>
        </div>

        {/* Difficulty & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'casual' | 'club' | 'master')}
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
            <option value="casual">Casual Bot</option>
            <option value="club">Club Bot (Balanced)</option>
            <option value="master">Master Bot (Aggressive)</option>
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
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Status & Player Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          padding: '10px 16px',
          background: winner ? '#fff2ea' : '#ffffff',
          border: '1px solid #C4A484',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: '#ffffff',
              border: '2px solid #654321',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#654321',
              fontSize: '14px',
            }}
          >
            <User size={15} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#654321' }}>You (White)</div>
            <div style={{ fontSize: '11px', color: '#82664c' }}>
              Captured: {capturedByWhite.map((p, i) => <span key={i} style={{ fontSize: '14px' }}>{PIECE_SYMBOLS.b[p.type]}</span>)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: winner ? '#a33b1e' : '#654321',
              letterSpacing: '-0.01em',
            }}
          >
            {isBotThinking ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} className="radar-spin" /> Thinking…
              </span>
            ) : (
              gameStatus
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#654321' }}>Bot (Black)</div>
            <div style={{ fontSize: '11px', color: '#82664c' }}>
              Captured: {capturedByBlack.map((p, i) => <span key={i} style={{ fontSize: '14px' }}>{PIECE_SYMBOLS.w[p.type]}</span>)}
            </div>
          </div>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: '#654321',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            <Bot size={15} />
          </div>
        </div>
      </div>

      {/* 8x8 Chessboard */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          maxWidth: '560px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          border: '4px solid #654321',
          boxShadow: '0 8px 24px rgba(101, 67, 33, 0.15)',
          userSelect: 'none',
        }}
      >
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isLight = (r + c) % 2 === 0
            const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c
            const isValidMove = validMoves.some(([vr, vc]) => vr === r && vc === c)
            const squareColor = isLight ? '#f5eee6' : '#c9a885'

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                style={{
                  position: 'relative',
                  background: isSelected ? '#ffea88' : squareColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (piece && piece.color === 'w') || isValidMove ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Coordinate indicators */}
                {c === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '3px',
                      fontSize: '9px',
                      fontWeight: 800,
                      color: isLight ? '#a8896c' : '#ffffff',
                      opacity: 0.75,
                    }}
                  >
                    {8 - r}
                  </span>
                )}
                {r === 7 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '3px',
                      fontSize: '9px',
                      fontWeight: 800,
                      color: isLight ? '#a8896c' : '#ffffff',
                      opacity: 0.75,
                    }}
                  >
                    {String.fromCharCode(97 + c)}
                  </span>
                )}

                {/* Valid move dot indicator */}
                {isValidMove && (
                  <div
                    style={{
                      position: 'absolute',
                      width: piece ? '34px' : '16px',
                      height: piece ? '34px' : '16px',
                      borderRadius: '50%',
                      background: piece ? 'transparent' : 'rgba(101, 67, 33, 0.35)',
                      border: piece ? '3px solid rgba(163, 59, 30, 0.65)' : 'none',
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Piece glyph */}
                {piece && (
                  <span
                    style={{
                      fontSize: 'clamp(28px, 6vw, 44px)',
                      lineHeight: 1,
                      color: piece.color === 'w' ? '#ffffff' : '#2d1b0d',
                      textShadow:
                        piece.color === 'w'
                          ? '0 1px 2px rgba(0,0,0,0.6), 0 0 1px #4a2c11'
                          : '0 1px 1px rgba(255,255,255,0.2)',
                      zIndex: 3,
                    }}
                  >
                    {PIECE_SYMBOLS[piece.color][piece.type]}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Match Records */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '16px',
          fontSize: '12px',
          color: '#82664c',
          fontWeight: 600,
        }}
      >
        <span>Player Wins: <strong style={{ color: '#654321' }}>{stats.wins}</strong></span>
        <span>Bot Wins: <strong style={{ color: '#654321' }}>{stats.losses}</strong></span>
        <span>Draws: <strong style={{ color: '#654321' }}>{stats.draws}</strong></span>
      </div>
    </div>
  )
}
