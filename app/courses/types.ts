export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  imageUrl: string;
  duration: string;
  modules: number;
  progress: number; // Changed from progress?: number to non-optional
}
