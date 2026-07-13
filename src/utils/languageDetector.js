/**
 * Detects the language of a text string based on specific priority rules.
 * @param {string} text - The input text to analyze
 * @returns {'hindi' | 'hinglish' | 'tanglish' | 'benglish' | 'english'} The detected language
 */
export function detectLanguage(text) {
  if (!text) return 'english'
  
  // 1. Devanagari -> Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hindi'
  }

  // 2. Hinglish Keywords (check before pure Latin/English check)
  const hinglishPatterns = [
    'mera', 'meri', 'mujhe', 'hai', 'nahi', 'kya', 'kaise', 
    'batao', 'bataiye', 'aur', 'kab', 'kahan', 'kyun', 'theek', 
    'accha', 'bilkul', 'matlab', 'samajh', 'bolna', 'chahiye'
  ]
  const textLower = text.toLowerCase()
  
  // Use word boundaries to avoid partial matches inside English words
  const hasHinglish = hinglishPatterns.some(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`)
    return regex.test(textLower)
  })
  
  if (hasHinglish) {
    return 'hinglish'
  }

  // 3. Tamil characters -> Tanglish
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'tanglish'
  }

  // 4. Bengali characters -> Benglish
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'benglish'
  }

  // 5 & 6. Default to English (pure Latin with no Hinglish/Tanglish/Benglish keywords)
  return 'english'
}

/**
 * Analyzes conversation language dynamics.
 * @param {Array<{role: string, content: string}>} messages 
 */
export function analyzeConversationLanguage(messages) {
  const userMessages = messages.filter(m => m.role === 'user')
  const latestMsg = userMessages[userMessages.length - 1]?.content || ''
  const prevMsg = userMessages[userMessages.length - 2]?.content || ''

  const currentLang = detectLanguage(latestMsg)
  const prevLang = prevMsg ? detectLanguage(prevMsg) : currentLang
  
  return {
    currentLanguage: currentLang,
    previousLanguage: prevLang,
    languageChanged: prevLang !== currentLang
  }
}
