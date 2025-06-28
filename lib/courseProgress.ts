// This file is kept for compatibility but doesn't do anything
// We're handling null checks directly in the components instead

export const ensureCourseProgressExists = (course: any) => {
  if (course && typeof course === 'object' && course.progress === undefined) {
    course.progress = 0;
  }
  return course;
};
