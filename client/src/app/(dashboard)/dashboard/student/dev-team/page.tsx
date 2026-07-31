import DashboardShell from '@/components/dashboard/DashboardShell';
import DevTeam from '@/components/features/DevTeam';

export default function Page() {
  return (
    <DashboardShell title="NACOS Dev Team">
      <DevTeam />
    </DashboardShell>
  );
}
