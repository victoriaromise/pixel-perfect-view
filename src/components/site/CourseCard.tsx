import { Link } from "@tanstack/react-router";
import { formatNaira, type Course } from "@/lib/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group flex flex-col border border-border bg-card transition-colors hover:border-secondary"
    >
      <div className="overflow-hidden bg-muted">
        <img src={course.flyer} alt={`${course.title} flyer`} loading="lazy" className="aspect-[4/5] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-xs text-primary">COURSE {course.number}</span>
        <h3 className="text-xl leading-tight">{course.title}</h3>
        <p className="text-sm text-muted-foreground">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-2xl font-bold not-italic text-accent">{formatNaira(course.price)}</span>
          <span className="text-sm text-secondary group-hover:underline">View course →</span>
        </div>
      </div>
    </Link>
  );
}
