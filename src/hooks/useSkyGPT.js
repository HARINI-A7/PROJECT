import { useState, useCallback, useRef } from 'react'
import { fetchSarvamCompletion } from '../api/sarvam'

const MAX_HISTORY_PAIRS = 20

export function useSkyGPT() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const isLoadingRef = useRef(false)

  // buildApiMessages now only trims history to keep it manageable.
  // The sarvam service layer handles system prompt injection and language detection.
  const buildApiMessages = useCallback((history) => {
    // Trim to last MAX_HISTORY_PAIRS exchanges (each pair = 1 user + 1 assistant)
    const trimmed = history.slice(-MAX_HISTORY_PAIRS * 2)
    return trimmed.map(m => ({ role: m.role, content: m.content }))
  }, [])

  const sendMessage = useCallback(async (text, contextOverride = null) => {
    const userText = (text || '').trim()
    if (!userText || isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }

    setMessages(prev => {
      const updated = [...prev, userMsg]
      return updated
    })

    try {
      // Build message list from current + new user message
      const historyForApi = await new Promise(resolve => {
        setMessages(prev => {
          resolve(prev)
          return prev
        })
      })

      const apiMessages = buildApiMessages(historyForApi)

      // Future-ready: inject contextOverride as additional system context
      if (contextOverride) {
        apiMessages.splice(1, 0, { role: 'system', content: contextOverride })
      }

      const reply = await fetchSarvamCompletion(apiMessages)

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const friendlyMessage =
        err.message.includes('No internet') ? 'No internet connection detected.' :
        err.message.includes('API key missing') ? 'SkyGPT is unavailable — API key not configured. Check SARVAM_API_KEY in .env file.' :
        err.message.includes('Rate limit') ? 'Rate limit reached. Please wait a moment and try again.' :
        err.message.includes('Authentication') ? 'SkyGPT authentication failed. Check your API key.' :
        'SkyGPT is temporarily unavailable. Please try again in a few moments.'

      setError(friendlyMessage)
      // Add error bubble in chat so user sees it inline
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        role: 'error',
        content: friendlyMessage,
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [buildApiMessages])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const regenerateLast = useCallback(async () => {
    setMessages(prev => {
      const lastUserIdx = [...prev].reverse().findIndex(m => m.role === 'user')
      if (lastUserIdx === -1) return prev
      const idx = prev.length - 1 - lastUserIdx
      const lastUserContent = prev[idx].content
      const withoutLast = prev.slice(0, idx + 1).filter(m => m.role !== 'error')
      // Remove previous assistant reply
      const withoutAssistant = withoutLast.filter((_, i) => i < idx)
      setTimeout(() => sendMessage(lastUserContent), 50)
      return withoutAssistant
    })
  }, [sendMessage])

  return { messages, isLoading, error, sendMessage, clearChat, regenerateLast }
}
