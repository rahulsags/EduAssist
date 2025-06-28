'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  ArrowLeft,
  CheckCircle,
  Lock,
  PlayCircle,
  FileText,
  Check,
  Clock,
  Calendar,
  BarChart3,
  Award
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Module {
  id: string;
  title: string;
  description: string;
  units: {
    id: string;
    title: string;
    type: 'video' | 'article' | 'quiz' | 'exercise';
    duration: string;
    completed?: boolean;
    locked?: boolean;
  }[];
  completed?: boolean;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  duration: string;
  modules: Module[];
  progress: number;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [activeTab, setActiveTab] = useState('curriculum')

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      try {
        // In a real app, fetch from Supabase based on course ID
        // For now, use mock data
        const mockCourse: CourseDetail = {
          id: params.id,
          title: params.id === 'c1' ? 'JavaScript Fundamentals' : 
                 params.id === 'c2' ? 'React.js: Zero to Hero' :
                 params.id === 'c3' ? 'Python for Data Science' :
                 'Course ' + params.id,
          description: 'This comprehensive course will take you through all the essential concepts you need to become proficient. Starting with the basics and building up to advanced topics, you\'ll gain hands-on experience through practical examples and exercises.',
          level: 'Intermediate',
          category: 'Web Development',
          instructor: 'Alex Johnson',
          duration: '4 weeks',
          modules: [
            {
              id: 'm1',
              title: 'Introduction and Setup',
              description: 'Get started with the basics and set up your development environment',
              completed: true,
              units: [
                {
                  id: 'u1',
                  title: 'Welcome to the Course',
                  type: 'video',
                  duration: '5 min',
                  completed: true
                },
                {
                  id: 'u2',
                  title: 'Setting Up Your Environment',
                  type: 'article',
                  duration: '10 min',
                  completed: true
                },
                {
                  id: 'u3',
                  title: 'First Steps Quiz',
                  type: 'quiz',
                  duration: '5 min',
                  completed: true
                }
              ]
            },
            {
              id: 'm2',
              title: 'Core Concepts',
              description: 'Learn the fundamental concepts that form the foundation',
              completed: false,
              units: [
                {
                  id: 'u4',
                  title: 'Understanding the Basics',
                  type: 'video',
                  duration: '15 min',
                  completed: true
                },
                {
                  id: 'u5',
                  title: 'Working with Data',
                  type: 'article',
                  duration: '12 min',
                  completed: false
                },
                {
                  id: 'u6',
                  title: 'Practice Exercise',
                  type: 'exercise',
                  duration: '20 min',
                  completed: false
                },
                {
                  id: 'u7',
                  title: 'Core Concepts Quiz',
                  type: 'quiz',
                  duration: '10 min',
                  completed: false
                }
              ]
            },
            {
              id: 'm3',
              title: 'Advanced Techniques',
              description: 'Take your skills to the next level with advanced concepts',
              completed: false,
              units: [
                {
                  id: 'u8',
                  title: 'Advanced Topic 1',
                  type: 'video',
                  duration: '20 min',
                  locked: true
                },
                {
                  id: 'u9',
                  title: 'Advanced Topic 2',
                  type: 'article',
                  duration: '15 min',
                  locked: true
                },
                {
                  id: 'u10',
                  title: 'Advanced Exercise',
                  type: 'exercise',
                  duration: '30 min',
                  locked: true
                }
              ]
            }
          ],
          progress: 35
        }

        // Try to fetch user progress from Supabase
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', params.id)
            .single()

          if (progressData && !progressError) {
            mockCourse.progress = progressData.progress
          }
        }

        setCourse(mockCourse)
      } catch (error) {
        console.error('Error fetching course:', error)
        toast.error('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.id, user])

  // Handle unit completion
  const markUnitComplete = async (moduleId: string, unitId: string) => {
    if (!user || !course) return

    try {
      // Update local state first (optimistic update)
      const updatedCourse = { ...course }
      let moduleIndex = -1
      let unitIndex = -1

      // Find the module and unit
      updatedCourse.modules.forEach((module, mIdx) => {
        module.units.forEach((unit, uIdx) => {
          if (module.id === moduleId && unit.id === unitId) {
            moduleIndex = mIdx
            unitIndex = uIdx
          }
        })
      })

      if (moduleIndex === -1 || unitIndex === -1) return

      // Mark the unit as completed
      updatedCourse.modules[moduleIndex].units[unitIndex].completed = true

      // Check if all units in the module are completed
      const allUnitsCompleted = updatedCourse.modules[moduleIndex].units.every(unit => unit.completed || unit.locked)
      if (allUnitsCompleted) {
        updatedCourse.modules[moduleIndex].completed = true
      }

      // Recalculate overall progress
      let completedUnits = 0
      let totalUnits = 0

      updatedCourse.modules.forEach(module => {
        module.units.forEach(unit => {
          if (!unit.locked) {
            totalUnits++
            if (unit.completed) completedUnits++
          }
        })
      })

      updatedCourse.progress = Math.round((completedUnits / totalUnits) * 100)

      setCourse(updatedCourse)

      // Update progress in Supabase
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: user.id,
            content_id: `${course.id}-${moduleId}-${unitId}`,
            content_type: 'course_unit',
            progress: 100,
            updated_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      // Also update overall course progress
      await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: user.id,
            content_id: course.id,
            content_type: 'course',
            progress: updatedCourse.progress,
            updated_at: new Date().toISOString()
          }
        ])

      toast.success('Progress updated')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

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

  if (!course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
              <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push('/courses')}>
                Back to Courses
              </Button>
            </div>
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
          {/* Back button and heading */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => router.push('/courses')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-700">
                    {course.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {course.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Last updated: June 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BarChart3 className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-medium">Your Progress</h3>
                  <p className="text-sm text-gray-600">Keep going, you're doing great!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {course.progress === 100 ? (
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <>
                    <span className="font-medium">{course.progress}%</span>
                    <div className="w-40 md:w-64">
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Course content tabs */}
          <Tabs defaultValue="curriculum" onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="mb-6">
              <TabsTrigger value="curriculum" className="text-base">
                <BookOpen className="h-4 w-4 mr-2" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-base">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <Card key={module.id} className="border-0 shadow-lg">
                  <CardHeader className={`${module.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white flex items-center justify-center border">
                          {module.completed ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="font-medium">{moduleIndex + 1}</span>
                          )}
                        </div>
                        <CardTitle>{module.title}</CardTitle>
                      </div>
                      {module.completed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {module.units.map((unit) => (
                        <div 
                          key={unit.id} 
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            unit.locked ? 'bg-gray-100' : unit.completed ? 'bg-green-50' : 'bg-white border'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {unit.type === 'video' && <PlayCircle className="h-5 w-5 text-blue-600" />}
                              {unit.type === 'article' && <FileText className="h-5 w-5 text-purple-600" />}
                              {unit.type === 'quiz' && <BarChart3 className="h-5 w-5 text-green-600" />}
                              {unit.type === 'exercise' && <Award className="h-5 w-5 text-yellow-600" />}
                            </div>
                            <div>
                              <p className={`font-medium ${unit.locked ? 'text-gray-500' : ''}`}>
                                {unit.title}
                                {unit.locked && ' (Locked)'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)} • {unit.duration}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            {unit.completed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : unit.locked ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => markUnitComplete(module.id, unit.id)}
                              >
                                {unit.type === 'video' ? 'Watch' : 
                                 unit.type === 'article' ? 'Read' :
                                 unit.type === 'quiz' ? 'Take Quiz' : 'Start'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    {course.description}
                  </p>
                  <p className="text-gray-700">
                    This course is designed for {course.level === 'Beginner' ? 'beginners who are just starting out' : 
                      course.level === 'Intermediate' ? 'learners with some prior knowledge' : 
                      'advanced students looking to master complex topics'} in {course.category}.
                  </p>
                  <div className="pt-4">
                    <h3 className="font-medium mb-2">What You'll Learn</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Core concepts and fundamentals</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Practical applications through hands-on exercises</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Best practices and industry standards</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Advanced techniques for real-world scenarios</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Instructor</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <p className="font-medium">{course.instructor}</p>
                        <p className="text-sm text-gray-600">Senior Developer & Educator</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
