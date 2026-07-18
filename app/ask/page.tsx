'use client'

import { useState } from 'react'
import { Send, MessageCircle, HelpCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  findings?: string[]
  metrics?: string[]
  evidence?: string[]
}

export default function AskDiscoveryOSPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m DiscoveryOS, your AI research analyst. Ask me anything about your customer research. Examples: "What\'s the biggest problem affecting premium customers?" or "Which issues affect multiple segments?"',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const exampleQuestions = [
    'What is the biggest problem affecting premium customers?',
    'Which themes affect multiple segments?',
    'What are the top blockers for Free Users?',
    'How many insights relate to payment failures?',
  ]

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content, projectId: 'proj-default' }),
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer || 'Unable to process question',
        findings: result.findings || [],
        metrics: result.metrics || [],
        evidence: result.supportingEvidence || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6 h-screen flex flex-col">
      <div>
        <h1 className="section-title">Ask DiscoveryOS</h1>
        <p className="text-slate-600">Evidence-backed answers to your product questions</p>
      </div>

      {/* Suggested Questions - shown when empty */}
      {messages.length === 1 && (
        <div className="space-y-3">
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <HelpCircle size={16} />
            <span>Example questions:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(question)
                }}
                className="text-left p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-sm text-slate-700 hover:border-blue-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.role === 'user' ? '' : 'w-full'}`}>
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto max-w-xl'
                      : 'bg-slate-50 text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap mb-3">{message.content}</p>

                  {/* Findings */}
                  {message.findings && message.findings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-300 text-sm">
                      <strong className="block mb-2">Key Findings:</strong>
                      <ul className="space-y-1 ml-2">
                        {message.findings.map((finding, idx) => (
                          <li key={idx} className="text-slate-700 list-disc">
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metrics */}
                  {message.metrics && message.metrics.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      {message.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-white rounded p-2 border border-slate-200">
                          {metric}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Evidence */}
                  {message.evidence && message.evidence.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-300 text-sm">
                      <strong className="block mb-2">Supporting Evidence:</strong>
                      <div className="space-y-1">
                        {message.evidence.map((ev, idx) => (
                          <div key={idx} className="text-slate-600 italic pl-2">
                            {ev}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your research..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
