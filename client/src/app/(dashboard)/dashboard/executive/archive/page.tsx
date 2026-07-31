import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveArchive from '@/components/features/ExecutiveArchive';

export default function Page() {
  return (
    <DashboardShell title="NACOS Archive">
      <ExecutiveArchive />
    </DashboardShell>
  );
}
