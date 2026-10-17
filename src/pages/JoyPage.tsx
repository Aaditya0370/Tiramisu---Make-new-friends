import { useState } from 'react'
import { ArrowRight, Dice5, Heart, PartyPopper, RotateCcw, Sparkles, ThumbsUp, Zap } from 'lucide-react'
import { questions, starters } from '../data/demo'
import { PageHeader, PrimaryButton } from '../components/UI'
import { cn } from '../lib/utils'

export function JoyPage() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const question = questions[questionIndex]
  const reactions = answer ? (answer === question.left ? ['Bold choice', 'I respect it', 'Tell me more'] : ['Excellent answer', 'That tracks', 'Plot twist']) : []

  function choose(option: string) {
    if (answer) return
    setAnswer(option)
    setScore((value) => value + 1)
  }
  function next() {
    setQuestionIndex((value) => (value + 1) % questions.length)
    setAnswer(null)
  }
  function reset() { setQuestionIndex(0); setAnswer(null); setScore(0) }

  return <div className="page-content joy-page"><PageHeader eyebrow="Make a little room for joy" title="Joy Room" description="Small games, easy opinions, zero pressure. The fastest route to a fun conversation." action={<div className="joy-score"><Zap size={15} /> {score} sparks</div>} />
    <div className="joy-layout"><section className="would-you-card"><div className="game-topline"><span className="game-chip"><Dice5 size={15} /> Would you rather</span><span className="question-count">{questionIndex + 1} / {questions.length}</span></div><div className="game-copy"><span className="eyebrow"><Sparkles size={13} /> {question.mood}</span><h2>{question.question}</h2></div><div className="answer-grid"><button className={cn('answer-card', answer === question.left && 'is-picked', answer && answer !== question.left && 'is-dimmed')} onClick={() => choose(question.left)}><span className="answer-letter">A</span><strong>{question.left}</strong><ArrowRight size={17} /></button><div className="or-divider"><span>or</span></div><button className={cn('answer-card', answer === question.right && 'is-picked', answer && answer !== question.right && 'is-dimmed')} onClick={() => choose(question.right)}><span className="answer-letter">B</span><strong>{question.right}</strong><ArrowRight size={17} /></button></div>{answer && <div className="answer-feedback"><div className="feedback-icon"><PartyPopper size={18} /></div><div><strong>You picked “{answer}”</strong><p>That says something lovely about your energy. What would your new friend pick?</p><div className="reaction-row">{reactions.map((reaction) => <button key={reaction} onClick={() => {}}><Heart size={13} /> {reaction}</button>)}</div></div></div>}<div className="game-actions"><button className="reset-button" onClick={reset}><RotateCcw size={15} /> Reset</button><PrimaryButton onClick={next}>{answer ? 'Another one' : 'Skip for now'}</PrimaryButton></div></section><aside className="joy-aside"><div className="joy-aside-head"><div><span className="eyebrow"><Heart size={13} /> Conversation fuel</span><h2>Keep it going</h2></div><span className="card-spark"><Sparkles size={16} /></span></div><p className="aside-intro">Save these for the moment when “what do you do?” is feeling a little too expected.</p><div className="starter-stack">{starters.map((starter, index) => <button className="starter-card" key={starter.label}><span className={`starter-number starter-${index + 1}`}>0{index + 1}</span><span><small>{starter.label}</small><strong>{starter.text}</strong></span><ArrowRight size={16} /></button>)}</div><div className="joy-tip"><ThumbsUp size={16} /><span><strong>Joy tip</strong> There is no wrong answer — only excellent follow-ups.</span></div></aside></div>
  </div>
}
