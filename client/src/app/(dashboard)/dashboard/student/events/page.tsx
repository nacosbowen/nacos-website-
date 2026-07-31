import DashboardShell from '@/components/dashboard/DashboardShell';
import CalendarEvents from '@/components/features/CalendarEvents';

export default function Page() {
  return (
    <DashboardShell title="NACOS Calendar Events">
      <CalendarEvents />
    </DashboardShell>
  );
}
