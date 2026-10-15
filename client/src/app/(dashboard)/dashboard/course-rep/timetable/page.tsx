import DashboardShell from '@/components/dashboard/DashboardShell';
import TimetableManager from '@/components/features/TimetableManager';

export default function Page() {
  return (
    <DashboardShell title="Timetable">
      <TimetableManager />
    </DashboardShell>
  );
}