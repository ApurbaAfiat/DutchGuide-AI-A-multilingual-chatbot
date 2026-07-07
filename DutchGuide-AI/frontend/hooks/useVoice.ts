/**
 * useVoice Hook
 * =============
 * Provides browser-based voice input (speech-to-text) and
 * speech output (text-to-speech) using the Web Speech API.
 */

'use client'

import { useState, useCallback, useRef } from 'react'

interface UseVoiceReturn {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  speak: (text: string, lang?: string) => void
  stopSpeaking: () => void
  isSupported: boolean
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US' // Can be made dynamic based on selected language

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const result = event.results[current]
      if (result.isFinal) {
        setTranscript(result[0].transcript)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!isSupported || !window.speechSynthesis) return

    // Stop any current speech
    window.speechSynthesis.cancel()

    // Strip markdown before speaking
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[(\d+)\]/g, '')
      .replace(/---/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)

    // Map language codes to BCP 47 locale tags
    const langMap: Record<string, string> = {
      en: 'en-US',
      nl: 'nl-NL',
      bn: 'bn-BD',
      hi: 'hi-IN',
    }
    utterance.lang = langMap[lang] || 'en-US'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported,
  }
}
