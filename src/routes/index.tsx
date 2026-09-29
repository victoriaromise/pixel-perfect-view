import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, ContactButtons } from "@/components/site/SiteLayout";
import { CourseCard } from "@/components/site/CourseCard";
import { COURSES } from "@/lib/courses";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VICTOR PROMISE — Learn Practical AI Skills" },
      { name: "description", content: "Learn AI prompting, AI images, AI video making, vibe coding and the full Advanced AI Masterclass with VICTOR PROMISE." },
      { property: "og:title", content: "VICTOR PROMISE — Learn Practical AI Skills" },
      { property: "og:description", content: "Practical AI courses for students, creators, professionals and business owners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FAQ = [
  ["Who are these courses for?", "Students, business owners, working professionals, content creators, entrepreneurs and complete beginners who want practical AI skills."],
  ["Do I need previous AI experience?", "No. Every course starts from the basics and builds up to professional results."],
  ["How do I pay?", "Pay the course fee to Opay, account number 9012125850, then submit your payment receipt on the course page."],
  ["How do I submit my payment receipt?", "Open the course you paid for, sign in, and upload a screenshot or PDF of your receipt in the payment section."],
  ["How long does payment verification take?", "Payments are checked manually. Message us on WhatsApp or Telegram after submitting to speed things up."],
  ["How do I contact VICTOR PROMISE?", "WhatsApp 09012125850 or Telegram @victorpromisee."],
  ["Can I take more than one course?", "Yes. You can enroll in as many courses as you like, or take the Advanced AI Masterclass to get everything."],
  ["What is included in the Advanced AI Masterclass?", "All topics from AI Prompting & Images, AI Video Making and Vibe Coding, plus AI workflows and digital products."],
  ["Can students participate?", "Absolutely. The courses are priced to be accessible for students."],
  ["Can business owners benefit from these courses?", "Yes. You will learn to create your own ads, visuals, videos and websites without hiring agencies."],
];

function Home() {
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.2fr_1fr] md:pt-24">
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-sm text-primary">// learn · use · earn with AI</p>
          <h1 className="text-5xl leading-[1.05] md:text-7xl">
            Turn AI into a <span className="italic text-accent">skill</span> that pays.
          </h1>
          <p className="mt-6 max-w-lg text-muted-foreground">
            Hands-on courses in AI prompting, image and flyer design, video production and AI-powered website building, taught for real life, real business and real income.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className="border border-secondary bg-primary px-6 py-3 font-semibold not-italic text-primary-foreground hover:bg-secondary">
              Explore courses
            </Link>
            <Link to="/courses/$slug" params={{ slug: "advanced-ai-masterclass" }} className="border border-border px-6 py-3 text-secondary hover:border-secondary">
              See the Masterclass
            </Link>
          </div>
        </div>
        <div className="relative hidden grid-cols-2 gap-3 md:grid">
          {COURSES.map((c, i) => (
            <Link key={c.slug} to="/courses/$slug" params={{ slug: c.slug }} className={`border border-border bg-card hover:border-secondary ${i % 2 ? "translate-y-8" : ""}`}>
              <img src={c.flyer} alt={`${c.title} flyer`} className="aspect-[4/5] w-full object-contain" />
            </Link>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
          <h2 className="text-4xl">The courses</h2>
          <span className="text-sm text-muted-foreground">04 programs</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COURSES.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="mb-10 text-4xl">How enrollment works</h2>
        <ol className="grid gap-px border border-border bg-border md:grid-cols-4">
          {["Pick a course", "Create an account", "Pay via Opay & upload receipt", "Get confirmed and start learning"].map((s, i) => (
            <li key={s} className="bg-background p-6">
              <span className="text-3xl font-bold not-italic text-primary">0{i + 1}</span>
              <p className="mt-3">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16">
        <h2 className="mb-8 text-4xl">Questions</h2>
        <Accordion type="single" collapsible>
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <div className="border border-primary bg-card p-8 md:p-12">
          <h2 className="text-4xl">Talk to VICTOR PROMISE</h2>
          <p className="mb-6 mt-3 text-muted-foreground">Questions about a course or your payment? Reach out directly.</p>
          <ContactButtons />
        </div>
      </section>
    </SiteLayout>
  );
}
