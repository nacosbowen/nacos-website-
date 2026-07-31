import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveRsvp from '@/components/features/ExecutiveRsvp';

export default function Page() {
  return (
    <DashboardShell title="RSVP Events">
      <ExecutiveRsvp />
    </DashboardShell>
  );
}
