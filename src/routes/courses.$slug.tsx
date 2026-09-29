import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout, ContactButtons } from "@/components/site/SiteLayout";
import { ReceiptUpload } from "@/components/site/ReceiptUpload";
import { CONTACT, formatNaira, getCourse } from "@/lib/courses";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.course;
    const title = c ? `${c.title} — VICTOR PROMISE` : "Course — VICTOR PROMISE";
    const desc = c ? `${c.subtitle}. ${formatNaira(c.price)}. Enroll with VICTOR PROMISE.` : "VICTOR PROMISE course";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl">Course not found</h1>
        <Link to="/courses" className="mt-6 inline-block text-secondary underline">See all courses</Link>
      </div>
    </SiteLayout>
  ),
  component: CoursePage,
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-7 px-5 py-8 sm:gap-10 sm:py-14 md:grid-cols-[1fr_1.1fr]">
        <div className="border border-border bg-card md:sticky md:top-24 md:self-start">
          <img src={course.flyer} alt={`${course.title} flyer`} className="w-full object-contain" />
        </div>
        <div>
          <p className="text-sm text-primary">COURSE {course.number}</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl md:text-5xl">{course.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{course.subtitle}</p>
          <p className="mt-5 text-4xl font-bold not-italic text-accent sm:text-5xl">{formatNaira(course.price)}</p>
          {course.slug === "advanced-ai-masterclass" && (
            <p className="mt-4 border-l-2 border-accent pl-4 text-sm">
              The complete curriculum in one course, for people who want every skill instead of buying courses individually.
            </p>
          )}

          <h2 className="mt-12 text-2xl">What you'll learn</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {course.outline.map((o) => (
              <li key={o} className="flex gap-3 py-3"><span className="text-secondary">▸</span>{o}</li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl">Why it matters</h2>
          <p className="mt-3 text-muted-foreground">{course.why}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.audience.map((a) => (
              <span key={a} className="border border-border px-3 py-1 text-xs">{a}</span>
            ))}
          </div>

          <div id="pay" className="mt-12 border border-primary bg-card p-4 sm:p-6">
            <h2 className="text-2xl">Payment</h2>
            <p className="mt-2 text-sm text-muted-foreground">Transfer {formatNaira(course.price)} to:</p>
            <div className="mt-4 grid gap-1 not-italic">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="text-xl font-bold">Opay</span>
              <span className="mt-2 text-sm text-muted-foreground">Account number</span>
              <span className="text-2xl font-bold tracking-wider text-secondary">{CONTACT.opayAccount}</span>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">After paying, upload your receipt below. Your enrollment is confirmed only after VICTOR PROMISE checks the payment.</p>
            <div className="mt-5 border-t border-border pt-5"><ReceiptUpload course={course} /></div>
            <div className="mt-6"><p className="mb-3 text-sm text-muted-foreground">Questions? Contact us:</p><ContactButtons /></div>
          </div>

          <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
            <Link to="/" className="flex min-h-12 items-center justify-center border border-border px-5 py-3 text-center hover:border-primary">Back Home</Link>
            <Link to="/courses" className="flex min-h-12 items-center justify-center border border-primary bg-primary px-5 py-3 text-center font-semibold not-italic text-primary-foreground hover:bg-secondary">Explore More Courses</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
