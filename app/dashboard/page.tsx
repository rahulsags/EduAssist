'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Progress import removed to fix build issues
import { Badge } from '@/components/ui/badge'
import SimpleProgress from '@/components/ui/simple-progress'
import { 
  Brain, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  ArrowRight,
  Zap,
  Layers
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    currentStreak: 0,
    weeklyProgress: 0,
    weeklyGrowth: {
      quizzes: 0,
      score: 0
    }
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch quiz results
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (quizError) throw quizError;
        
        if (quizData && quizData.length > 0) {
          // Calculate stats
          const totalQuizzes = quizData.length;
          let totalScore = 0;
          let totalQuestions = 0;
          
          quizData.forEach(quiz => {
            totalScore += quiz.score;
            totalQuestions += quiz.total_questions;
          });
          
          const averageScore = Math.round((totalScore / totalQuestions) * 100);
          
          // Calculate streak
          let streak = 0;
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Check if there's a quiz from today
          const todayQuiz = quizData.find(quiz => {
            const quizDate = new Date(quiz.created_at);
            return quizDate.toDateString() === today.toDateString();
          });
          
          if (todayQuiz) {
            streak = 1;
            
            // Go back in days to check for consecutive days
            let checkDate = yesterday;
            let keepChecking = true;
            
            while (keepChecking) {
              const dateString = checkDate.toDateString();
              const quizOnDate = quizData.find(quiz => {
                const quizDate = new Date(quiz.created_at);
                return quizDate.toDateString() === dateString;
              });
              
              if (quizOnDate) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                keepChecking = false;
              }
            }
          }
          
          // Calculate weekly progress - number of quizzes in the last 7 days divided by 7, multiplied by 100
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          
          const quizzesLastWeek = quizData.filter(quiz => {
            const quizDate = new Date(quiz.created_at);
            return quizDate >= lastWeek;
          }).length;
          
          const weeklyProgress = Math.min(Math.round((quizzesLastWeek / 7) * 100), 100);
          
          // Calculate growth compared to previous week
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const previousWeek = quizData.filter(quiz => {
            const quizDate = new Date(quiz.created_at);
            return quizDate >= twoWeeksAgo && quizDate < lastWeek;
          });
          
          // Calculate quiz count growth
          const previousWeekQuizCount = previousWeek.length;
          const quizGrowth = quizzesLastWeek - previousWeekQuizCount;
          
          // Calculate score growth
          let prevWeekTotalScore = 0;
          let prevWeekTotalQuestions = 0;
          
          previousWeek.forEach(quiz => {
            prevWeekTotalScore += quiz.score;
            prevWeekTotalQuestions += quiz.total_questions;
          });
          
          const prevWeekAvgScore = prevWeekTotalQuestions > 0 ? 
            Math.round((prevWeekTotalScore / prevWeekTotalQuestions) * 100) : 0;
          
          const currentWeekQuizzes = quizData.filter(quiz => {
            const quizDate = new Date(quiz.created_at);
            return quizDate >= lastWeek;
          });
          
          let currentWeekTotalScore = 0;
          let currentWeekTotalQuestions = 0;
          
          currentWeekQuizzes.forEach(quiz => {
            currentWeekTotalScore += quiz.score;
            currentWeekTotalQuestions += quiz.total_questions;
          });
          
          const currentWeekAvgScore = currentWeekTotalQuestions > 0 ? 
            Math.round((currentWeekTotalScore / currentWeekTotalQuestions) * 100) : 0;
          
          const scoreGrowth = currentWeekAvgScore - prevWeekAvgScore;
          
          setStats({
            totalQuizzes,
            averageScore,
            currentStreak: streak,
            weeklyProgress,
            weeklyGrowth: {
              quizzes: quizGrowth,
              score: scoreGrowth
            }
          });
          
          // Format recent activities
          const activities = quizData.slice(0, 5).map(quiz => {
            const quizDate = new Date(quiz.created_at);
            const now = new Date();
            const diffMs = now.getTime() - quizDate.getTime();
            const diffMins = Math.round(diffMs / 60000);
            const diffHours = Math.round(diffMs / 3600000);
            const diffDays = Math.round(diffMs / 86400000);
            
            let dateString = '';
            if (diffMins < 60) {
              dateString = `${diffMins} minutes ago`;
            } else if (diffHours < 24) {
              dateString = `${diffHours} hours ago`;
            } else {
              dateString = `${diffDays} days ago`;
            }
            
            return {
              id: quiz.id,
              type: 'quiz',
              topic: quiz.topic,
              score: Math.round((quiz.score / quiz.total_questions) * 100),
              date: dateString
            };
          });
          
          setRecentActivities(activities);
        } else {
          // If no data, use defaults
          setStats({
            totalQuizzes: 0,
            averageScore: 0,
            currentStreak: 0,
            weeklyProgress: 0,
            weeklyGrowth: {
              quizzes: 0,
              score: 0
            }
          });
          
          setRecentActivities([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user])

  // Generate recommended topics based on previous quiz topics or popular defaults
  const generateRecommendedTopics = () => {
    // If the user has taken quizzes, recommend related topics
    if (recentActivities.length > 0) {
      // Get existing topics
      const existingTopics = recentActivities
        .filter(activity => activity.type === 'quiz')
        .map(activity => activity.topic);
      
      // For each topic, create a related advanced topic if not already taken
      const recommendations = [];
      
      // JavaScript -> Advanced JavaScript / React / Node.js
      if (existingTopics.some(t => t.toLowerCase().includes('javascript') || t.toLowerCase().includes('js'))) {
        if (!existingTopics.some(t => t.toLowerCase().includes('advanced javascript'))) {
          recommendations.push({ id: 1, topic: 'Advanced JavaScript', difficulty: 'Intermediate', progress: 0 });
        }
        if (!existingTopics.some(t => t.toLowerCase().includes('react'))) {
          recommendations.push({ id: 2, topic: 'React', difficulty: 'Intermediate', progress: 0 });
        }
      }
      
      // React -> React Hooks / Next.js
      if (existingTopics.some(t => t.toLowerCase().includes('react'))) {
        if (!existingTopics.some(t => t.toLowerCase().includes('react hooks'))) {
          recommendations.push({ id: 3, topic: 'React Hooks', difficulty: 'Intermediate', progress: 0 });
        }
        if (!existingTopics.some(t => t.toLowerCase().includes('next.js'))) {
          recommendations.push({ id: 4, topic: 'Next.js', difficulty: 'Advanced', progress: 0 });
        }
      }
      
      // CSS -> CSS Grid / Animations / Tailwind
      if (existingTopics.some(t => t.toLowerCase().includes('css'))) {
        if (!existingTopics.some(t => t.toLowerCase().includes('css grid'))) {
          recommendations.push({ id: 5, topic: 'CSS Grid', difficulty: 'Intermediate', progress: 0 });
        }
        if (!existingTopics.some(t => t.toLowerCase().includes('tailwind'))) {
          recommendations.push({ id: 6, topic: 'Tailwind CSS', difficulty: 'Beginner', progress: 0 });
        }
      }
      
      // Python -> Django / Flask / Data Science
      if (existingTopics.some(t => t.toLowerCase().includes('python'))) {
        if (!existingTopics.some(t => t.toLowerCase().includes('django'))) {
          recommendations.push({ id: 7, topic: 'Django', difficulty: 'Intermediate', progress: 0 });
        }
        if (!existingTopics.some(t => t.toLowerCase().includes('data science'))) {
          recommendations.push({ id: 8, topic: 'Python Data Science', difficulty: 'Advanced', progress: 0 });
        }
      }
      
      // If we have recommendations, return up to 3
      if (recommendations.length > 0) {
        return recommendations.slice(0, 3);
      }
    }
    
    // Default recommendations if user hasn't taken quizzes or no related topics found
    return [
      { id: 1, topic: 'JavaScript Fundamentals', difficulty: 'Beginner', progress: 0 },
      { id: 2, topic: 'HTML & CSS Basics', difficulty: 'Beginner', progress: 0 },
      { id: 3, topic: 'Python Programming', difficulty: 'Beginner', progress: 0 },
    ];
  };
  
  // Handle starting a quiz with a recommended topic
  const startQuizWithTopic = (topic: string) => {
    router.push(`/quiz?topic=${encodeURIComponent(topic)}`);
  };
  
  const recommendedTopics = generateRecommendedTopics();

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
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600">
              Ready to continue your learning journey? Let's see what we can accomplish today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.weeklyGrowth.quizzes > 0 ? `+${stats.weeklyGrowth.quizzes}` : stats.weeklyGrowth.quizzes < 0 ? stats.weeklyGrowth.quizzes : "No change"} from last week
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.weeklyGrowth.score > 0 ? `+${stats.weeklyGrowth.score}%` : stats.weeklyGrowth.score < 0 ? `${stats.weeklyGrowth.score}%` : "No change"} from last week
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentStreak} days</div>
                <p className="text-xs text-muted-foreground">
                  {stats.currentStreak > 0 ? "Keep it up!" : "Start a streak today!"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weeklyProgress}%</div>
                <SimpleProgress value={stats.weeklyProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Action Cards */}
          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" 
                  onClick={() => router.push('/chat')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI Tutor Chat</CardTitle>
                    <CardDescription>
                      Get instant help and explanations from your AI tutor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Ask questions, get explanations, and learn concepts with personalized AI assistance.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:translate-x-1 transition-transform">
                  Start Chat <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" 
                  onClick={() => router.push('/courses')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Layers className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Courses & Roadmaps</CardTitle>
                    <CardDescription>
                      Structured learning paths for various topics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Follow guided learning paths with structured courses and roadmaps for popular topics.
                </p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 group-hover:translate-x-1 transition-transform">
                  Explore Paths <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" 
                  onClick={() => router.push('/results')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Progress & Results</CardTitle>
                    <CardDescription>
                      Track your learning journey and performance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  View detailed analytics of your quiz performance, learning trends, and progress over time.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:translate-x-1 transition-transform">
                  View Progress <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" 
                  onClick={() => router.push('/quiz')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Take a Quiz</CardTitle>
                    <CardDescription>
                      Test your knowledge with AI-generated quizzes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Choose any topic and get customized quizzes tailored to your learning level.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 group-hover:translate-x-1 transition-transform">
                  Generate Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {activity.type === 'quiz' ? (
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Brain className="h-5 w-5 text-purple-600" />
                        )}
                        <div>
                          <p className="font-medium">{activity.topic}</p>
                          <p className="text-sm text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                      {activity.score && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No recent activity yet. Take your first quiz!</p>
                    <Button className="mt-4" onClick={() => router.push('/quiz')}>
                      Start Learning
                    </Button>
                  </div>
                )}
                {recentActivities.length > 0 && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/results')}>
                    View All Results
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Learning Recommendations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-gray-600" />
                  <span>Recommended Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedTopics.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => startQuizWithTopic(item.topic)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.topic}</h4>
                      <Badge 
                        variant="outline" 
                        className={
                          item.difficulty === 'Beginner' ? 'border-green-500 text-green-700' :
                          item.difficulty === 'Intermediate' ? 'border-yellow-500 text-yellow-700' :
                          'border-red-500 text-red-700'
                        }
                      >
                        {item.difficulty}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <SimpleProgress value={item.progress} className="h-2" />
                      <p className="text-sm text-gray-500">{item.progress}% complete</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/quiz')}>
                  Explore More Topics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}