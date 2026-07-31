import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveVoting from '@/components/features/ExecutiveVoting';

export default function Page() {
  return (
    <DashboardShell title="NACOS Voting">
      <ExecutiveVoting />
    </DashboardShell>
  );
}
