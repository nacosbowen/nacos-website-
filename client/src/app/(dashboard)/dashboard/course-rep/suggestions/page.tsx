import DashboardShell from '@/components/dashboard/DashboardShell';
import SuggestionBox from '@/components/features/SuggestionBox';

export default function Page() {
  return (
    <DashboardShell title="Suggestion Box">
      <SuggestionBox />
    </DashboardShell>
  );
}
