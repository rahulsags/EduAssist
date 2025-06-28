'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Code, 
  BarChart3, 
  GraduationCap,
  ArrowRight, 
  Check,
  Clock,
  Layers,
  ChevronRight,
  Star,
  CalendarDays,
  PlayCircle,
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  imageUrl: string;
  duration: string;
  modules: number;
  progress: number; // Changed from optional to required with a default value
}

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  resources: {
    title: string;
    type: 'article' | 'video' | 'quiz' | 'project';
    url?: string;
    completed?: boolean;
  }[];
  completed?: boolean;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  steps: RoadmapStep[];
  progress: number;
}

import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function CoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [userProgress, setUserProgress] = useState<{[key: string]: number}>({})
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  // Categories for filtering
  const categories = ['Web Development', 'Data Science', 'Mobile Development', 'DevOps', 'Cloud Computing', 'UI/UX Design']

  // Fetch courses, roadmaps and user progress
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // In a real app, this would be fetched from Supabase
        // For now, we'll mock the data
        
        // First try to fetch from Supabase
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
        
        // If we have courses data in Supabase, use it, otherwise use mock data
        const mockCourses: Course[] = [
          {
            id: 'c1',
            title: 'JavaScript Fundamentals',
            description: 'Master the core concepts of JavaScript, from variables and data types to functions and objects.',
            level: 'Beginner',
            category: 'Web Development',
            imageUrl: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4',
            duration: '2 weeks',
            modules: 8,
            progress: 0
          },
          {
            id: 'c2',
            title: 'React.js: Zero to Hero',
            description: 'Build modern, reactive user interfaces with React. Learn hooks, context, and state management.',
            level: 'Intermediate',
            category: 'Web Development',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
            duration: '4 weeks',
            modules: 12,
            progress: 0
          },
          {
            id: 'c3',
            title: 'Python for Data Science',
            description: 'Learn how to analyze and visualize data using Python libraries like Pandas, NumPy, and Matplotlib.',
            level: 'Beginner',
            category: 'Data Science',
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
            duration: '3 weeks',
            modules: 10,
            progress: 0
          },
          {
            id: 'c4',
            title: 'Advanced CSS Techniques',
            description: 'Take your CSS skills to the next level with CSS Grid, Flexbox, animations, and more.',
            level: 'Intermediate',
            category: 'Web Development',
            imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2',
            duration: '2 weeks',
            modules: 6,
            progress: 0
          },
          {
            id: 'c5',
            title: 'Full Stack Development with MERN',
            description: 'Build complete web applications using MongoDB, Express, React, and Node.js.',
            level: 'Advanced',
            category: 'Web Development',
            imageUrl: 'https://images.unsplash.com/photo-1581276879432-15e50529f34b',
            duration: '6 weeks',
            modules: 15,
            progress: 0
          },
          {
            id: 'c6',
            title: 'Flutter Mobile App Development',
            description: 'Create cross-platform mobile applications with Flutter and Dart.',
            level: 'Intermediate',
            category: 'Mobile Development',
            imageUrl: 'https://images.unsplash.com/photo-1533417379241-6e2536f5af5d',
            duration: '5 weeks',
            modules: 14,
            progress: 0
          },
          {
            id: 'c7',
            title: 'Introduction to Machine Learning',
            description: 'Understand the basics of machine learning and build your first model.',
            level: 'Beginner',
            category: 'Data Science',
            imageUrl: 'https://images.unsplash.com/photo-1584697964151-151f3a607a2d',
            duration: '4 weeks',
            modules: 10,
            progress: 0
          },
          {
            id: 'c8',
            title: 'Docker for Beginners',
            description: 'Learn containerization and orchestration using Docker and Kubernetes.',
            level: 'Intermediate',
            category: 'DevOps',
            imageUrl: 'https://images.unsplash.com/photo-1593642635271-8b4b6f8f8a2f',
            duration: '3 weeks',
            modules: 8,
            progress: 0
          },
          {
            id: 'c9',
            title: 'AWS Cloud Practitioner Essentials',
            description: 'Get started with Amazon Web Services and cloud computing fundamentals.',
            level: 'Beginner',
            category: 'Cloud Computing',
            imageUrl: 'https://images.unsplash.com/photo-1584697964151-151f3a607a2d',
            duration: '2 weeks',
            modules: 6,
            progress: 0
          },
          {
            id: 'c10',
            title: 'UI/UX Design Bootcamp',
            description: 'From user research to prototyping, learn the essentials of UI/UX design.',
            level: 'Advanced',
            category: 'UI/UX Design',
            imageUrl: 'https://images.unsplash.com/photo-1584697964151-151f3a607a2d',
            duration: '5 weeks',
            modules: 12,
            progress: 0
          }
        ]

        const mockRoadmaps: Roadmap[] = [
          {
            id: 'r1',
            title: 'Frontend Developer Path',
            description: 'Comprehensive path to becoming a proficient frontend developer with modern technologies.',
            level: 'Beginner',
            category: 'Web Development',
            steps: [
              {
                id: 's1',
                title: 'HTML & CSS Basics',
                description: 'Learn the foundations of web development',
                resources: [
                  { title: 'HTML Structure Fundamentals', type: 'article', url: '#' },
                  { title: 'CSS Styling Basics', type: 'video', url: '#' },
                  { title: 'Building Your First Webpage', type: 'project', url: '#' }
                ],
                completed: false
              },
              {
                id: 's2',
                title: 'JavaScript Fundamentals',
                description: 'Master core JavaScript concepts',
                resources: [
                  { title: 'JavaScript Syntax Guide', type: 'article', url: '#' },
                  { title: 'Working with DOM', type: 'video', url: '#' },
                  { title: 'JavaScript Quiz', type: 'quiz', url: '/quiz?topic=JavaScript' }
                ],
                completed: false
              },
              {
                id: 's3',
                title: 'Frontend Frameworks',
                description: 'Learn React, Vue, or Angular',
                resources: [
                  { title: 'Introduction to React', type: 'article', url: '#' },
                  { title: 'Building Components in React', type: 'video', url: '#' },
                  { title: 'Todo App Project', type: 'project', url: '#' }
                ],
                completed: false
              }
            ],
            progress: 0
          },
          {
            id: 'r2',
            title: 'Python Developer Path',
            description: 'From Python basics to advanced applications in data science, web development, and automation.',
            level: 'Beginner',
            category: 'Data Science',
            steps: [
              {
                id: 's1',
                title: 'Python Fundamentals',
                description: 'Learn Python syntax and core concepts',
                resources: [
                  { title: 'Python Syntax Guide', type: 'article', url: '#' },
                  { title: 'Data Types & Functions', type: 'video', url: '#' },
                  { title: 'Python Basics Quiz', type: 'quiz', url: '/quiz?topic=Python' }
                ],
                completed: false
              },
              {
                id: 's2',
                title: 'Intermediate Python',
                description: 'Object-oriented programming and modules',
                resources: [
                  { title: 'Classes and Objects', type: 'article', url: '#' },
                  { title: 'Working with Libraries', type: 'video', url: '#' },
                  { title: 'Build a CLI Tool', type: 'project', url: '#' }
                ],
                completed: false
              },
              {
                id: 's3',
                title: 'Python Applications',
                description: 'Web, data science, or automation',
                resources: [
                  { title: 'Flask Web Development', type: 'article', url: '#' },
                  { title: 'Data Analysis with Pandas', type: 'video', url: '#' },
                  { title: 'Build an API', type: 'project', url: '#' }
                ],
                completed: false
              }
            ],
            progress: 0
          },
          {
            id: 'r3',
            title: 'Full Stack Developer',
            description: 'Complete journey from frontend to backend development with modern technologies.',
            level: 'Intermediate',
            category: 'Web Development',
            steps: [
              {
                id: 's1',
                title: 'Frontend Development',
                description: 'HTML, CSS, JavaScript, and React',
                resources: [
                  { title: 'Modern JavaScript', type: 'article', url: '#' },
                  { title: 'React Complete Guide', type: 'video', url: '#' },
                  { title: 'Frontend Quiz', type: 'quiz', url: '/quiz?topic=React' }
                ],
                completed: false
              },
              {
                id: 's2',
                title: 'Backend Development',
                description: 'Node.js, Express, and Databases',
                resources: [
                  { title: 'Node.js Fundamentals', type: 'article', url: '#' },
                  { title: 'Building RESTful APIs', type: 'video', url: '#' },
                  { title: 'Backend Project', type: 'project', url: '#' }
                ],
                completed: false
              },
              {
                id: 's3',
                title: 'Deployment & DevOps',
                description: 'CI/CD, Docker, and Cloud Services',
                resources: [
                  { title: 'Introduction to DevOps', type: 'article', url: '#' },
                  { title: 'Docker Crash Course', type: 'video', url: '#' },
                  { title: 'Deploy Full Stack App', type: 'project', url: '#' }
                ],
                completed: false
              }
            ],
            progress: 0
          }
        ]

        // Try to fetch user progress from Supabase
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
        
        // Parse progress data if available
        let userProgressData: {[key: string]: number} = {}
        if (progressData && !progressError) {
          progressData.forEach((item: any) => {
            userProgressData[item.content_id] = item.progress
          })
        }

        // Apply user progress to courses and roadmaps
        const finalCourses = mockCourses.map(course => {
          // Ensure progress is never undefined to fix build errors
          const progress = userProgressData[course.id] ?? 0;
          return {
            ...course,
            progress
          }
        })
        
        const finalRoadmaps = mockRoadmaps.map(roadmap => {
          // Calculate overall roadmap progress based on completed steps
          let stepProgress = 0
          const updatedSteps = roadmap.steps.map(step => {
            const isCompleted = userProgressData[step.id] === 100
            if (isCompleted) stepProgress++
            
            // Mark resources as completed based on user progress
            const updatedResources = step.resources.map(resource => ({
              ...resource,
              completed: userProgressData[`${step.id}-${resource.title}`] === 100
            }))
            
            return {
              ...step,
              completed: isCompleted,
              resources: updatedResources
            }
          })
          
          const overallProgress = roadmap.steps.length > 0 
            ? Math.round((stepProgress / roadmap.steps.length) * 100) 
            : 0
            
          return {
            ...roadmap,
            steps: updatedSteps,
            progress: overallProgress
          }
        })

        setCourses(finalCourses)
        setRoadmaps(finalRoadmaps)
        setUserProgress(userProgressData)
      } catch (error) {
        console.error('Error fetching courses/roadmaps:', error)
        toast.error('Failed to load courses and roadmaps')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Handle marking a resource as completed
  const markResourceCompleted = async (roadmapId: string, stepId: string, resourceTitle: string) => {
    if (!user) return

    try {
      // Optimistic update
      const updatedRoadmaps = roadmaps.map(roadmap => {
        if (roadmap.id !== roadmapId) return roadmap

        const updatedSteps = roadmap.steps.map(step => {
          if (step.id !== stepId) return step

          const updatedResources = step.resources.map(resource => {
            if (resource.title !== resourceTitle) return resource
            return { ...resource, completed: true }
          })

          // Check if all resources are completed to mark step as completed
          const allResourcesCompleted = updatedResources.every(r => r.completed)

          return {
            ...step,
            resources: updatedResources,
            completed: allResourcesCompleted
          }
        })

        // Recalculate roadmap progress
        const completedSteps = updatedSteps.filter(s => s.completed).length
        const progress = Math.round((completedSteps / updatedSteps.length) * 100)

        return {
          ...roadmap,
          steps: updatedSteps,
          progress
        }
      })

      setRoadmaps(updatedRoadmaps)

      // Update user progress in Supabase
      const progressKey = `${stepId}-${resourceTitle}`
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: user.id,
            content_id: progressKey,
            content_type: 'resource',
            progress: 100,
            updated_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      toast.success('Progress updated')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  // Handle enrolling in a course
  const enrollInCourse = async (courseId: string) => {
    if (!user) return

    try {
      // In a real app, this would create an enrollment record in Supabase
      toast.success('Successfully enrolled in course!')
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error('Error enrolling in course:', error)
      toast.error('Failed to enroll in course')
    }
  }

  // Filter courses based on category and level
  const filteredCourses = courses.filter(course => {
    // Ensure progress is always defined
    if (course.progress === undefined) {
      course.progress = 0;
    }
    
    return (
      (categoryFilter === 'all' || course.category === categoryFilter) &&
      (levelFilter === 'all' || course.level === levelFilter)
    )
  })

  // Filter roadmaps based on category and level
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    // Ensure progress is always defined
    if (roadmap.progress === undefined) {
      roadmap.progress = 0;
    }
    
    return (
      (categoryFilter === 'all' || roadmap.category === categoryFilter) &&
      (levelFilter === 'all' || roadmap.level === levelFilter)
    )
  })

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
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Learning Paths
            </h1>
            <p className="text-gray-600">
              Structured courses and roadmaps to guide your learning journey
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div>
              <label className="text-sm font-medium mr-2">Category:</label>
              <select 
                className="border rounded-md p-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mr-2">Level:</label>
              <select
                className="border rounded-md p-2"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Tabs for Courses and Roadmaps */}
          <Tabs defaultValue="courses" onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="courses" className="text-base">
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="roadmaps" className="text-base">
                <Layers className="h-4 w-4 mr-2" />
                Roadmaps
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-8">
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        <div 
                          className="w-full h-full bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url(${course.imageUrl})`,
                            backgroundColor: '#f3f4f6' // Fallback color
                          }}
                        ></div>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <Badge 
                            variant="outline" 
                            className={
                              course.level === 'Beginner' ? 'border-green-500 text-green-700' :
                              course.level === 'Intermediate' ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }
                          >
                            {course.level}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {course.category}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Layers className="h-4 w-4 mr-1" />
                            <span>{course.modules} modules</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{course.progress ?? 0}%</span>
                          </div>
                          <Progress value={course.progress ?? 0} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => enrollInCourse(course.id)}
                        >
                          {(course.progress ?? 0) > 0 ? 'Continue Learning' : 'Start Course'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No courses match your filters</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new content</p>
                  <Button onClick={() => { setCategoryFilter('all'); setLevelFilter('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Roadmaps Tab */}
            <TabsContent value="roadmaps" className="space-y-8">
              {filteredRoadmaps.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredRoadmaps.map((roadmap) => (
                    <Card key={roadmap.id} className="border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                          <Badge 
                            variant="outline" 
                            className={
                              roadmap.level === 'Beginner' ? 'border-green-500 text-green-700' :
                              roadmap.level === 'Intermediate' ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }
                          >
                            {roadmap.level}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {roadmap.category}
                          </Badge>
                        </div>
                        <CardTitle>{roadmap.title}</CardTitle>
                        <CardDescription>
                          {roadmap.description}
                        </CardDescription>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm font-medium">{roadmap.progress ?? 0}%</span>
                          </div>
                          <Progress value={roadmap.progress ?? 0} className="h-2" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {roadmap.steps.map((step, stepIndex) => (
                          <div key={step.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                {step.completed ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <span className="text-sm font-medium">{stepIndex + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{step.title}</h4>
                                  {step.completed && (
                                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                
                                <div className="mt-3 space-y-2">
                                  {step.resources.map((resource) => (
                                    <div 
                                      key={resource.title} 
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                      <div className="flex items-center">
                                        {resource.type === 'article' && <FileText className="h-4 w-4 text-blue-600 mr-2" />}
                                        {resource.type === 'video' && <PlayCircle className="h-4 w-4 text-red-600 mr-2" />}
                                        {resource.type === 'quiz' && <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />}
                                        {resource.type === 'project' && <Code className="h-4 w-4 text-green-600 mr-2" />}
                                        <span className="text-sm">{resource.title}</span>
                                      </div>
                                      
                                      {resource.completed ? (
                                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                      ) : (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-xs"
                                          onClick={() => {
                                            if (resource.url && resource.url.startsWith('/')) {
                                              router.push(resource.url);
                                            } else {
                                              markResourceCompleted(roadmap.id, step.id, resource.title);
                                            }
                                          }}
                                        >
                                          {resource.type === 'quiz' ? 'Take Quiz' : 
                                           resource.type === 'project' ? 'Start Project' :
                                           'Mark Complete'}
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No roadmaps match your filters</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new content</p>
                  <Button onClick={() => { setCategoryFilter('all'); setLevelFilter('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </ErrorBoundary>
    </ProtectedRoute>
  )
}
