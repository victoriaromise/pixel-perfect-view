import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatNaira, type Course } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";

export function CourseCard({ course }: { course: Course }) {
  const { session } = useAuth();
  const content = (
    <>
      <div className="overflow-hidden bg-muted">
        <img src={course.flyer} alt={`${course.title} flyer`} loading="lazy" className="aspect-[4/5] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <span className="text-xs font-semibold text-primary">COURSE {course.number}</span>
        <h3 className="text-xl leading-tight">{course.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{course.subtitle}</p>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-4">
          <span className="min-w-0 text-2xl font-bold not-italic text-accent">{formatNaira(course.price)}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
            View &amp; enrol <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </>
  );

  if (!session) {
    return (
      <Link
        to="/auth"
        search={{ redirect: `/courses/${course.slug}` }}
        className="group flex flex-col overflow-hidden border border-border bg-card shadow-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group flex flex-col overflow-hidden border border-border bg-card shadow-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
