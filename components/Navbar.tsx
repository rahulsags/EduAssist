'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Brain, LogOut, User, TrendingUp, Layers, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EduAssist
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/results')} 
            className="hidden md:flex items-center"
          >
            <TrendingUp className="mr-1 h-4 w-4 text-purple-600" />
            My Progress
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/courses')} 
            className="hidden md:flex items-center"
          >
            <Layers className="mr-1 h-4 w-4 text-orange-600" />
            Courses
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/quiz')} 
            className="hidden md:flex items-center"
          >
            <BookOpen className="mr-1 h-4 w-4 text-green-600" />
            Quizzes
          </Button>
          <span className="text-sm text-gray-600 hidden md:block">
            Welcome, {user?.full_name || user?.email?.split('@')[0]}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(user?.full_name || user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2 text-red-600">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}