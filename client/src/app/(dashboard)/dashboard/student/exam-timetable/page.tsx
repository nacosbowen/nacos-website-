import DashboardShell from '@/components/dashboard/DashboardShell';
import ExamTimetable from '@/components/features/ExamTimetable';

export default function Page() {
  return (
    <DashboardShell title="Exam Timetable">
      <ExamTimetable />
    </DashboardShell>
  );
}
