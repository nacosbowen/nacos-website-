import DashboardShell from '@/components/dashboard/DashboardShell';
import ExecutiveNotifications from '@/components/features/ExecutiveNotifications';

export default function Page() {
  return (
    <DashboardShell title="Post Notification">
      <ExecutiveNotifications />
    </DashboardShell>
  );
}