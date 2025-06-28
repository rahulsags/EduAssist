// Simplified version to avoid TypeScript errors
export const ensureCourseProgressExists = (course: any) => {
  if (course && course.progress === undefined) {
    course.progress = 0;
  }
  return course;
};
