import aiImages from "@/assets/flyer-ai-images.jpg.asset.json";
import aiVideo from "@/assets/flyer-ai-video.png.asset.json";
import vibe from "@/assets/flyer-vibe-coding.png.asset.json";
import master from "@/assets/flyer-masterclass.jpg.asset.json";
// Absolute host so flyers also load when the site is deployed outside Lovable (e.g. Vercel).
const ASSET_HOST = "https://aispecialistcourse.lovable.app";


export const CONTACT = {
  whatsappDisplay: "09012125850",
  whatsappUrl: "https://wa.me/2349012125850",
  telegramUrl: "https://t.me/victorpromisee",
  opayAccount: "9012125850",
};

export type Course = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  price: number;
  flyer: string;
  outline: string[];
  audience: string[];
  why: string;
};

export const COURSES: Course[] = [
  {
    slug: "ai-prompting-images-flyers",
    number: "01",
    title: "AI Prompting, AI Images & AI Flyers/Posters Professionally",
    subtitle: "Prompt like a pro and design visuals that sell",
    price: 3000,
    flyer: ASSET_HOST + aiImages.url,
    outline: [
      "Prompting as a professional",
      "Creating professional and realistic images using AI",
      "Designing professionally using AI/LLM tools",
    ],
    audience: ["Business owners", "Students", "Working-class professionals", "Entrepreneurs", "Creators", "Anyone curious about practical AI"],
    why: "Every business needs flyers, posters and product images. Knowing how to direct AI with clear prompts lets you produce professional visuals in minutes, save on design costs, and offer design as a paid service.",
  },
  {
    slug: "ai-video-making",
    number: "02",
    title: "AI Video Making",
    subtitle: "Creating Professional Videos and Movies With AI",
    price: 10000,
    flyer: ASSET_HOST + aiVideo.url,
    outline: [
      "Creating professional cinematic ads",
      "Creating professional UGC-style video content",
      "CGI ads",
      "AI vlog videos",
      "Creating movies with AI",
      "Creating professional lifestyle videos",
      "Creating professional and consistent characters",
      "Storyboarding",
    ],
    audience: ["Businesses", "Students", "Working professionals", "Content creators", "Entrepreneurs", "Anyone who wants professional video"],
    why: "Video is how people buy, learn and follow brands today. With AI you can produce ads, vlogs and short films without a studio or crew, making this one of the most in-demand skills you can offer.",
  },
  {
    slug: "vibe-coding",
    number: "03",
    title: "Vibe Coding",
    subtitle: "Creating Professional and Fully Functional Websites Using AI",
    price: 10000,
    flyer: ASSET_HOST + vibe.url,
    outline: [
      "AI Prompting for Coding",
      "Building websites with AI",
      "Building web apps with AI",
      "Deploying projects",
      "Appointment booking systems",
      "CRM dashboards",
      "Invoice generators",
      "Building AI chatbots",
      "Integrating AI chatbots into websites/apps",
    ],
    audience: ["Business owners", "Students", "Entrepreneurs", "Freelancers", "Working professionals", "People building digital products"],
    why: "You no longer need years of programming to launch a website or app. Vibe coding teaches you to build real, working tools for your business or clients using AI as your developer.",
  },
  {
    slug: "advanced-ai-masterclass",
    number: "04",
    title: "Advanced AI Masterclass",
    subtitle: "Learn the Complete AI Skillset",
    price: 20000,
    flyer: ASSET_HOST + master.url,
    outline: [
      "Everything in AI Prompting, Images & Flyers",
      "Everything in AI Video Making",
      "Everything in Vibe Coding",
      "AI podcast and AI film-making",
      "Digital products",
      "Mastering AI workflows",
    ],
    audience: ["Anyone who wants the full curriculum", "Creators building multiple income streams", "Business owners doing it all in-house", "Freelancers expanding their services"],
    why: "The complete path for people who want every skill instead of picking one course. You combine images, video and websites into full workflows, and it costs less than buying the three courses separately.",
  },
];

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
export const getCourse = (slug: string) => COURSES.find((c) => c.slug === slug);
