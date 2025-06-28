'use client'

import { useState, useRef, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Brain, Send, User, Lightbulb, BookOpen, Calculator, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getGroqResponse } from '@/lib/groq'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'explanation' | 'example' | 'question'
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to explore today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'question'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Get AI response, either from Groq or fallback to predefined responses
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Convert previous messages to the format expected by Groq
    const conversationHistory = messages
      .filter(msg => msg.id !== '1') // Skip the initial greeting
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
    
    try {
      // Try to use Groq API
      return await getGroqResponse(userMessage, conversationHistory);
    } catch (error) {
      console.error('Error with Groq API, falling back to predefined responses:', error);
      
      // Fallback to predefined responses if Groq API fails
      const message = userMessage.toLowerCase();
      
      if (message.includes('javascript') || message.includes('js')) {
        return "JavaScript is a dynamic programming language that's widely used for web development. Here's what makes it special:\n\n• **Dynamic Typing**: Variables can hold different types of values\n• **First-class Functions**: Functions can be stored in variables and passed around\n• **Prototype-based**: Objects can inherit directly from other objects\n\nWould you like me to explain any specific JavaScript concept or show you some examples?"
      }
      
      if (message.includes('react')) {
        return "React is a popular JavaScript library for building user interfaces. Key concepts include:\n\n• **Components**: Reusable pieces of UI\n• **JSX**: JavaScript syntax extension for writing HTML-like code\n• **State**: Data that changes over time\n• **Props**: Data passed between components\n\nWould you like to dive deeper into any of these concepts?"
      }
      
      if (message.includes('css') || message.includes('styling')) {
        return "CSS (Cascading Style Sheets) is used to style and layout web pages. Here are some fundamental concepts:\n\n• **Selectors**: Target specific HTML elements\n• **Box Model**: Margin, border, padding, and content\n• **Flexbox/Grid**: Modern layout systems\n• **Responsive Design**: Adapting to different screen sizes\n\nWhat specific CSS topic would you like to explore?"
      }
      
      return "That's an interesting question! I'm here to help you understand any topic. Could you provide a bit more detail about what you'd like to learn? I can explain concepts, provide examples, or help you work through problems step by step."
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await getAIResponse(newMessage)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'explanation'
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "Explain JavaScript closures",
    "How does React hooks work?",
    "What is CSS flexbox?",
    "Explain async/await in JavaScript"
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tutor Chat</h1>
            <p className="text-gray-600">
              Get instant explanations and personalized learning assistance
            </p>
          </div>

          <Card className="border-0 shadow-xl h-[600px] flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Learning Assistant</CardTitle>
                  <CardDescription>
                    Ready to help you understand any concept
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-[80%] ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={
                            message.sender === 'user' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }>
                            {message.sender === 'user' ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.type && message.sender === 'ai' && (
                            <div className="flex items-center space-x-1 mb-2">
                              {message.type === 'explanation' && <Lightbulb className="h-3 w-3 text-yellow-600" />}
                              {message.type === 'example' && <BookOpen className="h-3 w-3 text-green-600" />}
                              {message.type === 'question' && <Sparkles className="h-3 w-3 text-purple-600" />}
                              <Badge variant="secondary" className="text-xs">
                                {message.type}
                              </Badge>
                            </div>
                          )}
                          <div className="whitespace-pre-line text-sm">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="p-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Quick questions to get started:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto py-2 px-3"
                        onClick={() => setNewMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything you'd like to learn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}