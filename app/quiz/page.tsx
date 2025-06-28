'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BookOpen, Clock, CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizConfig {
  topic: string
  difficulty: string
  questionCount: number
}

export default function QuizPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quizState, setQuizState] = useState<'setup' | 'taking' | 'completed'>('setup')
  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  })
  
  // Get topic from URL if provided
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const topicParam = searchParams.get('topic')
    if (topicParam) {
      setConfig(prev => ({ ...prev, topic: topicParam }))
    }
  }, [])
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes

  // Mock quiz generation with more diverse questions
  const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Define question templates for different categories
    const questionTemplates = {
      // Fundamentals
      fundamentals: [
        {
          question: `What is a key concept in ${config.topic}?`,
          options: [
            'Variables store data values',
            'Functions are not reusable',
            'Code runs backwards',
            'Syntax is optional'
          ],
          correctAnswer: 0,
          explanation: 'Variables are fundamental in programming as they store and manage data values that can be used throughout your program.'
        },
        {
          question: `Which statement about ${config.topic} is correct?`,
          options: [
            `${config.topic} is only used for simple tasks`,
            `${config.topic} follows standardized principles`,
            `${config.topic} cannot be used professionally`,
            `${config.topic} was invented last year`
          ],
          correctAnswer: 1,
          explanation: `${config.topic}, like many subjects, follows standardized principles and best practices that have evolved over time.`
        },
        {
          question: `What makes ${config.topic} useful in real-world applications?`,
          options: [
            'Its complexity makes it impressive',
            'Its practical application to solving problems',
            'It cannot be used in real-world applications',
            'It requires minimal understanding'
          ],
          correctAnswer: 1,
          explanation: `${config.topic} is valuable because it can be applied practically to solve real-world problems and improve processes.`
        }
      ],
      // Best practices
      practices: [
        {
          question: `What is an important practice when learning ${config.topic}?`,
          options: [
            'Never practice',
            'Copy without understanding',
            'Practice regularly with understanding',
            'Memorize without application'
          ],
          correctAnswer: 2,
          explanation: 'Regular practice combined with understanding underlying concepts is the most effective way to master any subject.'
        },
        {
          question: `Best practice for ${config.topic} includes:`,
          options: [
            'Using unclear terminology',
            'Avoiding documentation',
            'Following established conventions',
            'Working without planning'
          ],
          correctAnswer: 2,
          explanation: 'Following established conventions ensures your work is understandable to others and maintains quality standards.'
        },
        {
          question: `To improve in ${config.topic}, one should:`,
          options: [
            'Avoid feedback from others',
            'Study only theory without practice',
            'Seek diverse resources and practice regularly',
            'Learn only one approach'
          ],
          correctAnswer: 2,
          explanation: 'Seeking diverse learning resources and applying knowledge through regular practice leads to comprehensive understanding.'
        }
      ],
      // Implementation
      implementation: [
        {
          question: `When implementing ${config.topic}, it's important to:`,
          options: [
            'Rush through the process',
            'Plan and structure your approach',
            'Avoid testing until the end',
            'Use as few resources as possible'
          ],
          correctAnswer: 1,
          explanation: 'Planning and structuring your approach helps ensure efficient implementation and reduces errors.'
        },
        {
          question: `A common challenge when working with ${config.topic} is:`,
          options: [
            'Too many resources available',
            'Managing complexity and organization',
            'Working too efficiently',
            'Having too few problems to solve'
          ],
          correctAnswer: 1,
          explanation: 'Managing complexity and staying organized are common challenges that require careful attention and good practices.'
        },
        {
          question: `For successful implementation of ${config.topic}, one should:`,
          options: [
            'Avoid using existing solutions',
            'Implement everything at once',
            'Start with small steps and iterate',
            'Skip the planning phase'
          ],
          correctAnswer: 2,
          explanation: 'Starting with small, manageable steps and iterating based on feedback leads to more successful implementations.'
        }
      ],
      // Problem-solving
      problemSolving: [
        {
          question: `When solving problems in ${config.topic}, debugging means:`,
          options: [
            'Adding more complexity',
            'Finding and fixing errors systematically',
            'Ignoring minor issues',
            'Starting over from scratch'
          ],
          correctAnswer: 1,
          explanation: 'Debugging is the process of systematically identifying, analyzing, and resolving errors to ensure proper functionality.'
        },
        {
          question: `An effective approach to solving complex problems in ${config.topic} is:`,
          options: [
            'Solving everything at once',
            'Breaking problems into smaller parts',
            'Always using the most advanced techniques',
            'Avoiding collaboration'
          ],
          correctAnswer: 1,
          explanation: 'Breaking complex problems into smaller, manageable parts makes them easier to solve and understand.'
        },
        {
          question: `Which technique is NOT recommended for ${config.topic} problem-solving?`,
          options: [
            'Systematic testing',
            'Learning from examples',
            'Working without a plan',
            'Seeking peer feedback'
          ],
          correctAnswer: 2,
          explanation: 'Working without a plan leads to inefficient problem-solving and increases the likelihood of errors.'
        }
      ]
    };

    // Create a pool of questions by choosing from each category
    let questionPool: Question[] = [];
    
    // Add questions from each category to the pool with IDs
    Object.keys(questionTemplates).forEach(category => {
      const categoryQuestions = questionTemplates[category as keyof typeof questionTemplates];
      // Shuffle questions within each category
      const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
      // Add 1-2 questions from each category depending on difficulty with IDs
      const numberToAdd = config.difficulty === 'easy' ? 1 : 2;
      shuffled.slice(0, numberToAdd).forEach((q, idx) => {
        questionPool.push({
          ...q,
          id: `${category}-${idx}-${Date.now()}`
        });
      });
    });
    
    // Shuffle all questions
    questionPool = questionPool.sort(() => 0.5 - Math.random());
    
    // Return requested number of questions
    return questionPool.slice(0, config.questionCount)
  }

  const handleStartQuiz = async () => {
    if (!config.topic.trim()) {
      toast.error('Please enter a topic for your quiz')
      return
    }

    setQuizState('taking')
    try {
      const questions = await generateQuiz(config)
      setCurrentQuiz(questions)
      setSelectedAnswers(new Array(questions.length).fill(''))
      setCurrentQuestion(0)
      setShowResults(false)
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.')
      setQuizState('setup')
    }
  }

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = value
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Save quiz results to Supabase
  const saveQuizResult = async () => {
    if (!user) return;
    
    const score = calculateScore().score;
    const percentage = calculateScore().percentage;
    
    try {
      const { error } = await supabase.from('quiz_results').insert({
        user_id: user.id,
        topic: config.topic,
        score: score,
        total_questions: currentQuiz.length,
        questions: currentQuiz,
        user_answers: selectedAnswers,
      });
      
      if (error) throw error;
      
      toast.success('Quiz results saved successfully!');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('Failed to save quiz results.');
    }
  }

  const completeQuiz = () => {
    // First set quizState to 'completed'
    setQuizState('completed')
    
    // Calculate score
    const score = selectedAnswers.reduce((correct, answer, index) => {
      const question = currentQuiz[index]
      return answer === question.options[question.correctAnswer] ? correct + 1 : correct
    }, 0)

    const percentage = Math.round((score / currentQuiz.length) * 100)
    
    // Show toast notification
    toast.success(`Quiz completed! You scored ${percentage}%`)
    
    // Save results to Supabase
    saveQuizResult();
    
    // Then set showResults to true to display the results view
    setTimeout(() => {
      setShowResults(true)
    }, 100) // Short delay to ensure state updates properly
  }

  const calculateScore = () => {
    const score = selectedAnswers.reduce((correct, answer, index) => {
      const question = currentQuiz[index]
      return answer === question.options[question.correctAnswer] ? correct + 1 : correct
    }, 0)
    return { score, percentage: Math.round((score / currentQuiz.length) * 100) }
  }

  const resetQuiz = () => {
    setQuizState('setup')
    setCurrentQuiz([])
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
    setConfig({ topic: '', difficulty: 'medium', questionCount: 5 })
  }

  if (quizState === 'setup') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Navbar />
          
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Quiz</h1>
              <p className="text-gray-600">
                Generate a personalized quiz on any topic with AI
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <span>Quiz Configuration</span>
                </CardTitle>
                <CardDescription>
                  Customize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">What topic would you like to be quizzed on?</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., JavaScript, React, Python, CSS, Math..."
                    value={config.topic}
                    onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={config.difficulty} onValueChange={(value) => setConfig(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>
                            <span>Beginner level</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>
                            <span>Intermediate level</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hard">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hard</Badge>
                            <span>Advanced level</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Select value={config.questionCount.toString()} onValueChange={(value) => setConfig(prev => ({ ...prev, questionCount: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 questions</SelectItem>
                        <SelectItem value="5">5 questions</SelectItem>
                        <SelectItem value="10">10 questions</SelectItem>
                        <SelectItem value="15">15 questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleStartQuiz}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                    disabled={!config.topic.trim()}
                  >
                    Generate Quiz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (quizState === 'taking' || quizState === 'completed') {
    const currentQ = currentQuiz[currentQuestion]
    const progress = ((currentQuestion + 1) / currentQuiz.length) * 100

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Navbar />
          
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Progress Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {config.topic} Quiz
                </h1>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Question {currentQuestion + 1} of {currentQuiz.length}
                  </Badge>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {!showResults ? (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl leading-relaxed">
                    {currentQ?.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup 
                    value={selectedAnswers[currentQuestion]} 
                    onValueChange={handleAnswerSelect}
                    className="space-y-3"
                  >
                    {currentQ?.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswers[currentQuestion]}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {currentQuestion === currentQuiz.length - 1 ? 'Finish Quiz' : 'Next'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Results View
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex justify-center mb-4">
                    <Trophy className="h-16 w-16 text-yellow-500" />
                  </div>
                  <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                  <CardDescription className="text-lg">
                    Here's how you performed on {config.topic}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Score Summary */}
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {calculateScore().percentage}%
                    </div>
                    <p className="text-lg text-gray-600">
                      {calculateScore().score} out of {currentQuiz.length} correct
                    </p>
                  </div>

                  {/* Question Review */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Question Review</h3>
                    {currentQuiz.map((question, index) => {
                      const isCorrect = selectedAnswers[index] === question.options[question.correctAnswer]
                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3 mb-3">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium mb-2">{question.question}</p>
                              <div className="space-y-1 text-sm">
                                <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                  Your answer: {selectedAnswers[index] || 'Not answered'}
                                </p>
                                {!isCorrect && (
                                  <p className="text-green-700">
                                    Correct answer: {question.options[question.correctAnswer]}
                                  </p>
                                )}
                                <p className="text-gray-600 italic">
                                  {question.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button 
                      onClick={resetQuiz}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Take Another Quiz
                    </Button>
                    <Button 
                      onClick={() => {
                        window.location.href = '/results';
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View All Results
                    </Button>
                    <Button 
                      onClick={() => {
                        // Force hard navigation to the dashboard
                        window.location.href = '/dashboard';
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Add a debug fallback UI to detect if we're falling through without rendering
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Quiz State Error</CardTitle>
              <CardDescription>
                There was an error displaying the quiz. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="mb-4">Current state: {quizState}</p>
                <Button onClick={resetQuiz}>Return to Quiz Setup</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}