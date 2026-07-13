import { analyzeConversationLanguage, detectLanguage } from '../utils/languageDetector'

export const SUGGESTIONS = [
  "Why is my flight delayed?",
  "Will I miss my connecting flight?",
  "Am I eligible for compensation for a delayed flight?",
  "When should I leave for the airport?",
  "क्या मेरी फ्लाइट समय पर है?",
  "इंडिगो की बैगेज पॉलिसी क्या है?",
]

const BASE_SYSTEM_PROMPT = `You are SkyGPT.

You are the AI travel copilot inside FlightPulse AI.

You help Indian airline passengers with:

- Flight delays
- Airport guidance
- Baggage rules
- Visa guidance
- Airline policies
- DGCA passenger rights
- Travel recommendations

Never invent flight schedules,
prices,
airport information,
or airline policies.

If unsure, say so honestly.`

const STYLE_INSTRUCTION = `

Keep responses concise.

Default response:

Maximum 3-4 bullet points.
Each bullet: one short sentence.
No long introductions.

Avoid phrases like:
- Sure!
- Great question!
- बिल्कुल
- अरे
- Absolutely!

Immediately answer the question.

End with:
"Need more details? Just ask."`

const ELABORATION_RULE = `

Only generate long explanations when the user explicitly asks.

Examples:
- explain more
- tell me more
- elaborate
- detail please
- aur batao
- detail mein batao
- विस्तार से बताओ

Otherwise always keep answers concise.`

const LANG_INSTRUCTIONS = {
  english: `
Language Instruction

The latest user message is written in English.
Respond ONLY in English.
Ignore every previous conversation language.
The latest user message always determines your response language.`,

  hindi: `
Language Instruction

The latest user message is written in Hindi.
Respond ONLY in Hindi.
Ignore every previous conversation language.
The latest user message always determines your response language.`,

  hinglish: `
Language Instruction

The latest user message is written in Hinglish (mix of Hindi and English).
Respond naturally in Hinglish.
Mirror the user's language style exactly.
Do not convert everything to pure Hindi.
Do not convert everything to pure English.
Ignore every previous conversation language.`,

  tanglish: `
Language Instruction

The latest user message is written in Tanglish (mix of Tamil and English).
Respond naturally in Tanglish.
Mirror the user's language style exactly.
Ignore every previous conversation language.`,

  benglish: `
Language Instruction

The latest user message is written in Benglish (mix of Bengali and English).
Respond naturally in Benglish.
Mirror the user's language style exactly.
Ignore every previous conversation language.`
}

// Internal helper for API call
async function executeApiRequest(messages) {
  const res = await fetch('/api/sarvam/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sarvam-30b',
      messages: messages,
      temperature: 0.3, 
    }),
  })

  if (res.status === 401) {
    const err = await res.json()
    if (err.error === 'MISSING_API_KEY') {
      console.error(err.message)
      throw new Error('Sarvam API key missing or invalid. Check SARVAM_API_KEY in .env file.')
    }
    throw new Error('Authentication failed (401).')
  }

  if (res.status === 429) {
    throw new Error('Rate limit reached.')
  }

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`)
  }

  const data = await res.json()
  if (data?.choices?.[0]?.message?.content) {
    return data.choices[0].message.content
  }

  throw new Error('Unexpected response format from Sarvam API.')
}

/**
 * Sends a chat request to Sarvam AI via the Vite proxy.
 * Implements strict multi-language detection, context resetting, and prompt injection.
 * 
 * @param {Array<{role: string, content: string}>} messages 
 * @returns {Promise<string>} The assistant's text reply
 */
export async function fetchSarvamCompletion(messages) {
  try {
    // 1. Analyze language dynamics
    const { currentLanguage, previousLanguage, languageChanged } = analyzeConversationLanguage(messages)

    let contextReset = false
    let contextMessages = []

    // 2. Handle Conversation Context Reset
    if (languageChanged) {
      contextReset = true
      // Extract ONLY the latest user message
      const reversedMessages = [...messages].reverse()
      const latestUserMsg = reversedMessages.find(m => m.role === 'user')
      if (latestUserMsg) {
        contextMessages.push(latestUserMsg)
      }
    } else {
      // Find unbroken chain of same language
      let cutIndex = -1
      let expectedLang = null
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i]
        if (msg.role === 'user') {
          const lang = detectLanguage(msg.content)
          if (expectedLang === null) {
            expectedLang = lang
            cutIndex = i
          } else if (lang === expectedLang) {
            cutIndex = i // Chain continues
          } else {
            break // Chain broken
          }
        }
      }
      contextMessages = cutIndex !== -1 ? messages.slice(cutIndex) : []
    }

    // Logging exactly as requested
    console.log(`[SkyGPT Language] Detected Language: ${currentLanguage}`)
    console.log(`[SkyGPT Language] Previous Language: ${previousLanguage}`)
    console.log(`[SkyGPT Language] Language Changed: ${languageChanged}`)
    console.log(`[SkyGPT Language] Context Reset: ${contextReset}`)
    console.log(`[SkyGPT Language] Retry Triggered: false`)

    // 3. Rebuild System Prompt
    const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n${LANG_INSTRUCTIONS[currentLanguage]}\n${STYLE_INSTRUCTION}\n${ELABORATION_RULE}`
    const systemMsg = { role: 'system', content: fullSystemPrompt }
    
    // Combine fresh system prompt with trimmed context
    const rebuiltMessages = [systemMsg, ...contextMessages]

    // 4. Send Initial Request
    let reply = await executeApiRequest(rebuiltMessages)

    // 5. Language Validation
    const responseLang = detectLanguage(reply)
    
    if (responseLang !== currentLanguage) {
      console.log(`[SkyGPT Language] Expected ${currentLanguage}, but got ${responseLang}. Retrying...`)
      console.log(`[SkyGPT Language] Retry Triggered: true`)
      
      const retrySystemMsg = {
        role: 'system',
        content: `${fullSystemPrompt}\n\nCRITICAL: YOU MUST RESPOND IN ${currentLanguage.toUpperCase()} RIGHT NOW. DO NOT USE ANY OTHER LANGUAGE.`
      }
      const retryMessages = [retrySystemMsg, ...contextMessages]
      
      reply = await executeApiRequest(retryMessages)
    }

    return reply
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('No internet connection detected.')
    }
    throw err
  }
}
