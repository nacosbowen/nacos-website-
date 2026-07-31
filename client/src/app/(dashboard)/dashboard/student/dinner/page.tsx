import DashboardShell from '@/components/dashboard/DashboardShell';
import DinnerTheme from '@/components/features/DinnerTheme';

export default function Page() {
  return (
    <DashboardShell title="NACOS Dinner Theme">
      <DinnerTheme />
    </DashboardShell>
  );
}
