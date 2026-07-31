import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveCalendar from '@/components/features/ExecutiveCalendar';

export default function Page() {
  return (
    <DashboardShell title="Manage Events">
      <ExecutiveCalendar />
    </DashboardShell>
  );
}
