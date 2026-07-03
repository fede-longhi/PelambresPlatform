import { CourseBadges } from '@/components/education/course-badges';
import { CourseDetailFacts } from '@/components/education/course-detail-facts';
import { CourseLearningSection } from '@/components/education/course-learning-section';
import { CourseNotesSection } from '@/components/education/course-notes-section';
import type { CustomerCourseDetail } from '@/lib/data/customer-course-data';

export default function CourseClassroomContent({ course }: { course: CustomerCourseDetail }) {
  return (
    <div className="space-y-8">
      <div>
        <CourseBadges modality={course.modality} level={course.level} />
        <p className="mt-4 text-muted-foreground">{course.shortDescription}</p>
      </div>

      <CourseLearningSection
        learningObjective={course.learningObjective}
        learningOutcomes={course.learningOutcomes}
        variant="compact"
      />

      <CourseDetailFacts course={course} variant="grid" />

      {course.notes && <CourseNotesSection notes={course.notes} variant="compact" />}
    </div>
  );
}
