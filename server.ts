import express from 'express'
import { createServer as createViteServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenAI } from '@google/genai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3000
const host = '0.0.0.0'

app.use(express.json({ limit: '10mb' }))

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null

// POST /api/chat - Gemini-powered simulated friend response
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      contactName,
      contactBio,
      contactInterests,
      contactPrompt,
      contactEnergy,
      history,
    } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' })
    }

    if (ai) {
      const systemInstruction = `You are ${contactName || 'a friend'}, a local living in SoHo / Lower Manhattan, NYC.
Your profile details:
- Bio: "${contactBio || 'Explorer, coffee lover, always up for spontaneous plans.'}"
- Interests: ${Array.isArray(contactInterests) ? contactInterests.join(', ') : contactInterests || 'Design, walks, music, food'}
- Energy/Vibe: "${contactEnergy || 'Warm, thoughtful, witty'}"
- Starter prompt: "${contactPrompt || 'Looking for fellow foodies and art strolls.'}"

You are chatting on the Tiramisu friendship app. Note that the live platform is simulating this friend persona so users can test local banter, plans, and icebreakers before live meetups.
Your instructions:
- Reply naturally in 1 to 3 concise, conversational sentences (around 20-50 words).
- Speak like a friendly young adult in NYC (warm, casual, down-to-earth, never preachy or robotic).
- React directly to what the user said, and suggest a specific local idea or ask an easy follow-up question.
- Do NOT say you are an AI language model or assistant. Stay completely in-character as ${contactName || 'this friend'}.
- No hashtags, no corporate talk, at most 1 subtle emoji.`

      // Format previous chat turns
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
      if (Array.isArray(history) && history.length > 0) {
        // take up to the last 6 messages
        const recentHistory = history.slice(-6)
        for (const item of recentHistory) {
          if (item.text) {
            contents.push({
              role: item.from === 'me' ? 'user' : 'model',
              parts: [{ text: item.text }],
            })
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      })

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.85,
        },
      })

      const replyText = response.text?.trim()
      if (replyText) {
        return res.json({
          reply: replyText,
          model: 'gemini-3.8-flash',
          isSimulated: true,
        })
      }
    }

    // Graceful fallback responses if no API key or if quota/rate limited
    const fallbacks = [
      `Totally agree! I was just walking past Prince St and noticed the sweetest little bakery. Have you been there yet?`,
      `That's so real haha! Honestly that's why I love this neighborhood. Are you free for a quick coffee stroll this week?`,
      `I love that vibe. Reminds me of this rooftop reading spot on Mercer. What's been the highlight of your week so far?`,
      `100%! Always down to meet people with that same energy. What kind of music or podcasts are you listening to lately?`,
    ]
    const chosenFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    return res.json({
      reply: chosenFallback,
      model: 'simulated-fallback',
      isSimulated: true,
    })
  } catch (error) {
    console.error('Gemini chat generation error:', error)
    return res.json({
      reply: `That sounds like a wonderful plan! Lower Manhattan is full of hidden spots for that. What area do you spend the most time in?`,
      model: 'simulated-fallback',
      isSimulated: true,
    })
  }
})

// Development with Vite middleware or production static build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production'

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host,
      },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')))
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
    })
  }

  app.listen(port, host, () => {
    console.log(`Tiramisu server running at http://${host}:${port}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
