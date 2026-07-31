import DashboardShell from '@/components/dashboard/DashboardShell';
import RsvpTickets from '@/components/features/RsvpTickets';

export default function Page() {
  return (
    <DashboardShell title="RSVP Tickets">
      <RsvpTickets />
    </DashboardShell>
  );
}
