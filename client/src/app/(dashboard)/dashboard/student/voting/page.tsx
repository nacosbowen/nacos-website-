import DashboardShell from '@/components/dashboard/DashboardShell';
import NacosVoting from '@/components/features/NacosVoting';

export default function Page() {
  return (
    <DashboardShell title="NACOS Voting">
      <NacosVoting />
    </DashboardShell>
  );
}
