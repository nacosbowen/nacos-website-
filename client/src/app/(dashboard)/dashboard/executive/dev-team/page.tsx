import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveDevTeam from '@/components/features/ExecutiveDevTeam';

export default function Page() {
  return (
    <DashboardShell title="Dev Team Applications">
      <ExecutiveDevTeam />
    </DashboardShell>
  );
}
