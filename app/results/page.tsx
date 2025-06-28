'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Progress import removed to fix build issues
import SimpleProgress from '@/components/ui/simple-progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Calendar, Trophy, Target, BookOpen, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface QuizResult {
  id: string
  topic: string
  score: number
  totalQuestions: number
  date: string
  difficulty: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch actual quiz results from Supabase
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedResults: QuizResult[] = data.map(item => ({
            id: item.id,
            topic: item.topic,
            score: item.score,
            totalQuestions: item.total_questions,
            date: new Date(item.created_at).toISOString().split('T')[0],
            difficulty: 'medium' // Default if not stored
          }));
          
          setResults(formattedResults);
        } else {
          // If no data, use mock data
          const mockResults: QuizResult[] = [
            {
              id: '1',
              topic: 'JavaScript Basics',
              score: 4,
              totalQuestions: 5,
              date: '2025-01-20',
              difficulty: 'medium'
            },
            {
              id: '2',
              topic: 'React Fundamentals',
              score: 7,
              totalQuestions: 10,
              date: '2025-01-19',
              difficulty: 'easy'
            },
            {
              id: '3',
              topic: 'CSS Flexbox',
              score: 8,
              totalQuestions: 10,
              date: '2025-01-18',
              difficulty: 'hard'
            }
          ];
          setResults(mockResults);
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        toast.error('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [user]);

  const calculateStats = () => {
    if (results.length === 0) return { totalQuizzes: 0, averageScore: 0, totalQuestions: 0, totalCorrect: 0 }
    
    const totalQuizzes = results.length
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0)
    const totalCorrect = results.reduce((sum, result) => sum + result.score, 0)
    const averageScore = Math.round((totalCorrect / totalQuestions) * 100)
    
    return { totalQuizzes, averageScore, totalQuestions, totalCorrect }
  }

  const getChartData = () => {
    return results
      .slice()
      .reverse()
      .map((result, index) => ({
        quiz: index + 1,
        percentage: Math.round((result.score / result.totalQuestions) * 100),
        topic: result.topic,
        date: result.date
      }))
  }

  const getTopicPerformance = () => {
    const topicMap = new Map()
    
    results.forEach(result => {
      const percentage = Math.round((result.score / result.totalQuestions) * 100)
      if (topicMap.has(result.topic)) {
        const existing = topicMap.get(result.topic)
        topicMap.set(result.topic, {
          topic: result.topic,
          averageScore: Math.round((existing.averageScore + percentage) / 2),
          attempts: existing.attempts + 1
        })
      } else {
        topicMap.set(result.topic, {
          topic: result.topic,
          averageScore: percentage,
          attempts: 1
        })
      }
    })
    
    return Array.from(topicMap.values()).slice(0, 5)
  }

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const stats = calculateStats()
  const chartData = getChartData()
  const topicPerformance = getTopicPerformance()

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
            <p className="text-gray-600">
              Track your quiz performance and identify areas for improvement
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">Completed successfully</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                <Trophy className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">{stats.totalCorrect} correct answers</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Accuracy rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Trend */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Performance Trend</span>
                </CardTitle>
                <CardDescription>Your quiz scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quiz" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value}%`,
                        'Score',
                        `Topic: ${props.payload.topic}`
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Topic Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>Topic Performance</span>
                </CardTitle>
                <CardDescription>Average scores by topic</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="topic" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value}%`,
                        'Average Score',
                        `Attempts: ${props.payload.attempts}`
                      ]}
                    />
                    <Bar dataKey="averageScore" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quiz Results */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span>Recent Quiz Results</span>
                  </CardTitle>
                  <CardDescription>Your latest quiz performances</CardDescription>
                </div>
                <Button onClick={() => router.push('/quiz')} className="bg-blue-600 hover:bg-blue-700">
                  Take New Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.slice(0, 6).map((result) => {
                  const percentage = Math.round((result.score / result.totalQuestions) * 100)
                  return (
                    <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{result.topic}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(result.date).toLocaleDateString()} • {result.score}/{result.totalQuestions} correct
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className={getDifficultyBadgeColor(result.difficulty)}
                        >
                          {result.difficulty}
                        </Badge>
                        
                        <div className="text-right min-w-[100px]">
                          <div className={`text-lg font-bold ${
                            percentage >= 90 ? 'text-green-600' :
                            percentage >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {percentage}%
                          </div>
                          <SimpleProgress value={percentage} className="w-20 h-2" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {results.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz results yet</h3>
                  <p className="text-gray-500 mb-6">Take your first quiz to start tracking your progress!</p>
                  <Button onClick={() => router.push('/quiz')} className="bg-blue-600 hover:bg-blue-700">
                    Take Your First Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}