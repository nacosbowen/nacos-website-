const COURSES = [
  {
    code: 'CS',
    title: 'Computer Science',
    description:
      'Foundations of computation, algorithms, data structures, artificial intelligence, and systems design.',
  },
  {
    code: 'SE',
    title: 'Software Engineering',
    description:
      'Principles of building scalable, maintainable software — from architecture and design patterns to deployment.',
  },
  {
    code: 'CYB',
    title: 'Cyber Security',
    description:
      'Protecting digital systems and data — network security, ethical hacking, cryptography, and threat analysis.',
  },
  {
    code: 'IFT',
    title: 'Information Technology',
    description:
      'Managing and applying technology solutions — IT infrastructure, systems administration, and digital transformation.',
  },
];

export default function CoursesSection() {
  return (
    <section id="courses" className="py-28 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-sm font-semibold tracking-widest uppercase mb-4 text-gray-500"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Departments
          </span>
          <h2 className="text-4xl font-black text-gray-900">Our Courses</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">
            Four cutting-edge programmes under NACOS Bowen
          </p>
        </div>

        {/* 3D Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 items-stretch">
          {COURSES.map((course) => (
            <div key={course.code} className="group relative cursor-default h-full">

              {/* Depth layer 2 — deepest */}
              <div className="absolute top-4 left-4 right-[-8px] bottom-[-8px] bg-gray-300 rounded-2xl transition-all duration-300 group-hover:top-5 group-hover:left-5" />
              {/* Depth layer 1 */}
              <div className="absolute top-2 left-2 right-[-4px] bottom-[-4px] bg-gray-200 rounded-2xl transition-all duration-300 group-hover:top-3 group-hover:left-3" />

              {/* Main card */}
              <div className="relative bg-white rounded-2xl p-7 border border-gray-100 h-full
                shadow-[0_4px_6px_rgba(0,0,0,0.04),0_10px_20px_rgba(0,0,0,0.08),0_20px_40px_rgba(0,0,0,0.06)]
                transition-all duration-300
                group-hover:-translate-y-2 group-hover:shadow-[0_8px_16px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.12),0_40px_80px_rgba(0,0,0,0.08)]
                flex flex-col gap-4"
              >
                {/* Course code */}
                <span
                  className="text-xs font-bold tracking-widest uppercase text-gray-300"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {course.code}
                </span>

                {/* Title */}
                <h3 className="text-xl font-black text-gray-900 leading-snug">
                  {course.title}
                </h3>

                {/* Divider */}
                <div className="w-8 h-0.5 bg-gray-200 rounded-full transition-all duration-300 group-hover:w-16 group-hover:bg-gray-400" />

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  {course.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
