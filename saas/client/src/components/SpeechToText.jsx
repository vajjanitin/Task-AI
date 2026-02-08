import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'

const SpeechToText = ({ onFinalTranscript }) => {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    // create once but don't start yet
    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = navigator.language || 'en-US'
    recognitionRef.current = rec

    return () => {
      try {
        rec.onresult = null
        rec.onend = null
        rec.onerror = null
        rec.stop()
      } catch (e) {}
    }
  }, [])

  const startListening = () => {
    const rec = recognitionRef.current
    if (!rec) return
    let finalTranscript = ''
    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interim += transcript
        }
      }
      if (finalTranscript.trim()) {
        // send final transcript back to parent and clear accumulator
        onFinalTranscript(finalTranscript.trim())
        finalTranscript = ''
      }
    }

    rec.onerror = (e) => {
      // stop listening on error
      console.error('SpeechRecognition error', e)
      setListening(false)
      try { rec.stop() } catch (er) {}
    }

    rec.onend = () => {
      setListening(false)
    }

    try {
      rec.start()
      setListening(true)
    } catch (e) {
      // start can throw if already started
      console.warn('Could not start SpeechRecognition', e)
    }
  }

  const stopListening = () => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      rec.stop()
    } catch (e) {}
    setListening(false)
  }

  if (!supported) {
    return (
      <button disabled className="theme-toggle-btn opacity-50" title="Speech recognition not supported">
        <MicOff className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={() => (listening ? stopListening() : startListening())}
      aria-pressed={listening}
      aria-label={listening ? 'Stop dictation' : 'Start dictation'}
      className={`theme-toggle-btn p-1 ${listening ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      title={listening ? 'Stop dictation' : 'Start dictation'}
    >
      {listening ? <Mic className="w-4 h-4 text-red-400 animate-pulse" /> : <MicOff className="w-4 h-4" />}
    </button>
  )
}

export default SpeechToText
