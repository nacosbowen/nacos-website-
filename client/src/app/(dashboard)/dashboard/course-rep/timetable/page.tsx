import DashboardShell from '@/components/dashboard/DashboardShell';
import CourseRepTimetable from '@/components/features/CourseRepTimetable';

export default function Page() {
  return (
    <DashboardShell title="Timetable Manager">
      <CourseRepTimetable />
    </DashboardShell>
  );
}
