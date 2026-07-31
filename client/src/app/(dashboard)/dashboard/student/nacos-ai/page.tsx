import DashboardShell from '@/components/dashboard/DashboardShell';
import NacosAI from '@/components/features/NacosAI';

export default function Page() {
  return (
    <DashboardShell title="NACOS AI">
      <NacosAI />
    </DashboardShell>
  );
}
