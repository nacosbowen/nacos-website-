import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveSuggestions from '@/components/features/ExecutiveSuggestions';

export default function Page() {
  return (
    <DashboardShell title="Suggestions Inbox">
      <ExecutiveSuggestions />
    </DashboardShell>
  );
}
