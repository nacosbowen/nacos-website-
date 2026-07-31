import DashboardShell from '@/components/dashboard/DashboardShell';
import StudentTimetable from '@/components/features/StudentTimetable';

export default function Page() {
  return (
    <DashboardShell title="Class Timetable">
      <StudentTimetable />
    </DashboardShell>
  );
}
