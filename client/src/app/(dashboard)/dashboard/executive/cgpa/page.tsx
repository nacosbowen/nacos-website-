import DashboardShell from '@/components/dashboard/DashboardShell';
import CgpaCalculator from '@/components/features/CgpaCalculator';

export default function Page() {
  return (
    <DashboardShell title="CGPA Calculator">
      <CgpaCalculator />
    </DashboardShell>
  );
}
