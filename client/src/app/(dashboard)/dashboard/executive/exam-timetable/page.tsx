import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveExamTimetable from '@/components/features/ExecutiveExamTimetable';

export default function Page() {
  return (
    <DashboardShell title="Exam Timetable">
      <ExecutiveExamTimetable />
    </DashboardShell>
  );
}
