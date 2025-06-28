# EduAssist - AI-Powered Learning Platform

EduAssist is a comprehensive personalized learning platform that leverages AI to provide intelligent tutoring, dynamic quiz generation, learning path recommendations, and progress tracking. Built for the Personalized Education hackathon theme.

## 🚀 Features

### Core Features
- **AI Tutor Chat**: Interactive AI assistant for concept explanations and Q&A
- **Smart Quiz Generation**: AI-powered quiz creation for any topic with customizable difficulty
- **Structured Courses**: Complete learning paths with modules and lessons
- **Learning Roadmaps**: Step-by-step guides for mastering specific skills
- **Progress Tracking**: Comprehensive analytics with visual charts and performance metrics
- **Learning Recommendations**: Personalized learning paths based on quiz performance
- **User Authentication**: Secure sign-up/sign-in with demo credentials
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **Protected Routes**: Secure access to authenticated content
- **Real-time Updates**: Live progress tracking and immediate feedback
- **Modern UI**: Clean, professional interface with smooth animations
- **Performance Analytics**: Visual charts using Recharts library
- **Database Integration**: Supabase backend for user data and quiz results

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🏁 Quick Start

### Demo Credentials
Use these credentials to test the application immediately:
- **Email**: `demo@student.com`
- **Password**: `eduhack2025`

### Environment Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd eduassist
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Configuration (Optional - currently using mock data)
   GROQ_API_KEY=your_groq_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Database Setup (Supabase)**
   
   Click the "Connect to Supabase" button in the top right of your Bolt environment, or manually set up:
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to the `.env.local` file
   - Run the following SQL in your Supabase SQL editor to create the required tables:

   ```sql
   -- Create profiles table
   CREATE TABLE IF NOT EXISTS profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create quiz_results table
   CREATE TABLE IF NOT EXISTS quiz_results (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     topic TEXT NOT NULL,
     score INTEGER NOT NULL,
     total_questions INTEGER NOT NULL,
     questions JSONB NOT NULL,
     user_answers TEXT[] NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create learning_paths table
   CREATE TABLE IF NOT EXISTS learning_paths (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     topic TEXT NOT NULL,
     difficulty TEXT NOT NULL,
     status TEXT DEFAULT 'recommended',
     progress INTEGER DEFAULT 0,
     recommended_at TIMESTAMPTZ DEFAULT NOW(),
     completed_at TIMESTAMPTZ
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
   ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can read own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can read own quiz results" ON quiz_results
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own quiz results" ON quiz_results
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can read own learning paths" ON learning_paths
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own learning paths" ON learning_paths
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to `http://localhost:3000`

## 📱 Application Structure

### Pages
- **Landing Page** (`/`): Welcome page with feature overview
- **Authentication** (`/auth`): Sign-in/sign-up with demo credentials
- **Dashboard** (`/dashboard`): Main hub with stats and quick actions
- **AI Chat** (`/chat`): Interactive AI tutor for Q&A and explanations
- **Quiz** (`/quiz`): AI-generated quizzes with customizable topics and difficulty
- **Results** (`/results`): Performance analytics and quiz history

### Key Components
- **ProtectedRoute**: Authentication wrapper for secure pages
- **Navbar**: Navigation with user menu and sign-out
- **AuthContext**: Global authentication state management

### Database Schema
- **profiles**: User information and preferences
- **quiz_results**: Quiz performance and answer history
- **learning_paths**: Personalized learning recommendations

## 🎯 Key Features Walkthrough

### 1. AI Tutor Chat
- Real-time chat interface with AI assistant
- Context-aware responses for programming and academic topics
- Quick question suggestions for easy start
- Typing indicators and smooth scrolling

### 2. Smart Quiz Generation
- Topic-based quiz creation (e.g., "JavaScript", "React", "Python")
- Difficulty levels: Easy, Medium, Hard
- Customizable question count (3, 5, 10, 15)
- Immediate feedback with explanations
- Progress tracking during quiz

### 3. Progress Analytics
- Performance trend charts showing score progression
- Topic-specific performance analysis
- Success rate calculations
- Recent activity tracking
- Visual progress indicators

### 4. Learning Recommendations
- AI-suggested topics based on quiz performance
- Difficulty progression recommendations
- Progress tracking for recommended paths
- Personalized learning journey

## 🔧 Customization & Extension

### Adding Real AI Integration
Replace mock AI responses in `/app/chat/page.tsx` and `/app/quiz/page.tsx`:

```typescript
// Example for Groq integration
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
});
```

### Adding New Features
1. Create new pages in the `app/` directory
2. Add navigation links in `components/Navbar.tsx`
3. Update protected routes as needed
4. Extend database schema for new data requirements

## 📚 Feature Details

### Courses & Roadmaps
The platform offers structured learning experiences through:

1. **Interactive Courses**
   - Complete curriculum with modules and lessons
   - Multiple content types (videos, articles, quizzes)
   - Progress tracking and completion certificates
   - Instructor information and resource materials

2. **Learning Roadmaps**
   - Step-by-step guides to master specific skills
   - Curated resources for each learning stage
   - Interactive progress tracking with completion markers
   - Customized recommendations based on user interests

## 📊 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting with Next.js
- **Image Optimization**: Next.js Image component with optimization
- **Caching**: Built-in caching for static assets and API responses
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Demo login works with provided credentials
- [ ] Dashboard loads with sample data
- [ ] AI chat responds to messages
- [ ] Quiz generation works for different topics
- [ ] Results page shows performance data
- [ ] Navigation between pages works smoothly
- [ ] Responsive design on mobile/tablet

### Automated Testing (Future Enhancement)
Consider adding:
- Jest for unit testing
- Cypress for E2E testing
- React Testing Library for component testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Hackathon Ready

This application is fully configured for hackathon submission with:
- ✅ Working demo credentials
- ✅ Complete feature set
- ✅ Professional UI/UX
- ✅ Responsive design
- ✅ Database integration
- ✅ Authentication system
- ✅ AI-powered features (mockable)
- ✅ Deployment ready
- ✅ Comprehensive documentation

**Live Demo**: Deploy to Vercel and share the live URL for immediate testing!

## 📞 Support

For questions or issues:
1. Check the demo credentials: `demo@student.com` / `eduhack2025`
2. Verify environment variables are set correctly
3. Ensure Supabase project is configured
4. Check browser console for any errors

---

Built with ❤️ for the Personalized Education hackathon theme. Happy learning! 🎓