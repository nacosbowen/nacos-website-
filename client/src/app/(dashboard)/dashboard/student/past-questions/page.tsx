import DashboardShell from '@/components/dashboard/DashboardShell';
import PastQuestions from '@/components/features/PastQuestions';

export default function Page() {
  return (
    <DashboardShell title="Past Questions">
      <PastQuestions />
    </DashboardShell>
  );
}
