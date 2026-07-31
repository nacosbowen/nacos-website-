import DashboardShell from '@/components/dashboard/DashboardShell';
import ManagePastQuestions from '@/components/features/ManagePastQuestions';

export default function Page() {
  return (
    <DashboardShell title="Past Questions">
      <ManagePastQuestions />
    </DashboardShell>
  );
}
