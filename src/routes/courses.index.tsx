import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CourseCard } from "@/components/site/CourseCard";
import { COURSES } from "@/lib/courses";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "All Courses — VICTOR PROMISE" },
      { name: "description", content: "Browse all four VICTOR PROMISE AI courses: images & flyers, video making, vibe coding and the Advanced AI Masterclass." },
      { property: "og:title", content: "All Courses — VICTOR PROMISE" },
      { property: "og:description", content: "Four practical AI courses from ₦3,000." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
        <h1 className="text-4xl sm:text-5xl">All courses</h1>
        <p className="mb-7 mt-3 leading-relaxed text-muted-foreground sm:mb-10">Choose one skill, or take the Masterclass for everything.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COURSES.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </section>
    </SiteLayout>
  ),
});
