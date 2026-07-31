import DashboardShell from '@/components/dashboard/DashboardShell';
import NacosArchive from '@/components/features/NacosArchive';

export default function Page() {
  return (
    <DashboardShell title="NACOS Archive">
      <NacosArchive />
    </DashboardShell>
  );
}
