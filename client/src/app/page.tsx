import LandingNavbar from '@/components/LandingNavbar';
import AboutSection from '@/components/AboutSection';
import CoursesSection from '@/components/CoursesSection';
import ExecutivesSection from '@/components/ExecutivesSection';
import CommunitiesSection from '@/components/CommunitiesSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <AboutSection />
      <CoursesSection />
      <ExecutivesSection />
      <CommunitiesSection />
    </main>
  );
}
