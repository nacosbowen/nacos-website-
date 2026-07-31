import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveDinner from '@/components/features/ExecutiveDinner';

export default function Page() {
  return (
    <DashboardShell title="NACOS Dinner">
      <ExecutiveDinner />
    </DashboardShell>
  );
}
