import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  
} from "motion/react";
import { useEffect, useRef, useState,  } from "react";
import { useAuth, useUser, Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { Link } from 'react-router-dom';
import archesImage from "../assets/arches.png";
import heroImage from "../assets/hero-makkah.png";
import pilgrimsImage from "../assets/pilgrims.png";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] ;

function Reveal({ children, delay = 0, y = 24, className, as = "div" }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

const lineVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const lineChild = {
  hidden: { opacity: 0, y: "0.42em" },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

function Rule({ tone, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={`block h-px origin-left ${tone === "brass" ? "bg-brass" : "bg-green"} ${className}`}
      initial={reduce ? { opacity: 0 } : { scaleX: 0, opacity: 1 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: EASE }}
    />
  );
}

function Eyebrow({ children, tone = "green" }) {
  const color = {
    brass: "text-brass",
    ivory: "text-ivory/70",
    green: "text-green",
    olive: "text-olive-muted",
  }[tone];
  const rule =
    tone === "ivory"
      ? "bg-green-muted opacity-90"
      : tone === "brass"
        ? "bg-current opacity-60"
        : "bg-green";
  return (
    <span className={`eyebrow inline-flex items-center gap-3 ${color}`}>
      <span aria-hidden className={`h-px w-6 ${rule}`} />
      {children}
    </span>
  );
}

function ArrowLink({ href, children, variant = "green" }) {
  const styles = {
    solid: "bg-olive text-ivory hover:bg-olive-deep",
    ivory: "bg-ivory text-green-deep hover:bg-stone",
    green: "bg-green text-ivory hover:bg-green-deep",
    "green-outline": "border border-green/60 text-green hover:border-green hover:bg-green/8",
    outline: "border border-current text-current hover:border-green-muted hover:text-green-muted",
    ghost: "px-0 py-2 text-current hover:text-green",
  };
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-3 px-7 py-4 text-[0.8125rem] font-medium uppercase tracking-[0.14em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${styles[variant]}`}
    >
      {children}
      <span
        aria-hidden
        className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
      >
        &#8594;
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const NAV = [
  { label: "About", href: "#purpose" },
  { label: "How It Works", href: "#ecosystem" },
  { label: "For Organisations", href: "#organisations" },
  { label: "For Employees", href: "#organisations" },
];

const FOOTER_NAV = [...NAV, { label: "Portal Login", href: "#final" }];

const HEADLINE = ["Prepare today", "for a journey", "that matters."];
const GREEN_LINE = "that matters.";

const STAGES = [
  { label: "Intention", note: "A decision is made, and recorded." },
  { label: "Participation", note: "An organisation opens the way." },
  { label: "Contribution", note: "Amounts are agreed and set aside." },
  { label: "Progress", note: "Every payment is visible." },
  { label: "Preparation", note: "The journey becomes reachable." },
];


const SIDES = [
  {
    title: "Organisation",
    points: [
      "Opens participation",
      "Holds the agreements",
      "Sees contribution activity",
      "Keeps orderly records",
    ],
  },
  {
    title: "Employee",
    points: [
      "Sets a contribution",
      "Builds a payment history",
      "Reviews their agreement",
      "Watches progress accumulate",
    ],
  },
];

const PATHWAY = ["Organisation", "Participation", "Employee", "Contribution", "Progress"];


const [ORG_BLOCK, EMP_BLOCK] = [
  {
    eyebrow: "For organisations",
    heading: ["Built for", "organisations."],
    body: "Employers can offer their teams a considered way to prepare, without carrying the administrative weight alone.",
    items: [
      "Structured participation",
      "Clear records",
      "Employee oversight",
      "Agreement management",
    ],
  },
  {
    eyebrow: "For employees",
    heading: ["Designed", "around people."],
    body: "Each person keeps their own view of the journey — what they have set aside, what they agreed to, and how far along they are.",
    items: [
      "Personal contribution journey",
      "Accessible records",
      "Payment visibility",
      "Preparation progress",
    ],
  },
];

const PRINCIPLES = [
  {
    title: "Security",
    body: "Access is role-based and protected, so records are only visible to those who should see them.",
  },
  {
    title: "Transparency",
    body: "Contributions, agreements and payment history are stated plainly and kept up to date.",
  },
  {
    title: "Governance",
    body: "Clear responsibilities between the organisation, the participant and the fund.",
  },
  {
    title: "Accountability",
    body: "Activity is recorded, so every figure can be traced back to its origin.",
  },
];


/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar({ dashboardLink }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const inverted = !scrolled && !open;

  const FOOTER_NAV = [...NAV, { label: "Portal Login", href: dashboardLink }];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ${
          scrolled
            ? "border-b border-olive/10 bg-ivory/85 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-6 md:px-10"
        >
          <a href="#top" className="block leading-none flex items-center gap-3">
            <div>
              <span className={`block font-serif text-[1.55rem] font-light tracking-[0.32em] transition-colors duration-700 ${inverted ? "text-ivory" : "text-olive"}`}>
                HAJJ SAVINGS
              </span>
              <span className={`mt-1 block text-[0.5625rem] font-medium uppercase tracking-[0.3em] transition-colors duration-700 ${inverted ? "text-green-pale/80" : "text-green"}`}>
                Hajj Savings Fund
              </span>
            </div>
          </a>

          <div className="hidden items-center gap-10 lg:flex">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`link-rule text-[0.8125rem] tracking-[0.06em] transition-colors duration-500 ${
                      inverted
                        ? "text-ivory/85 hover:text-white"
                        : "text-olive/80 hover:text-green"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <span
              aria-hidden
              className={`h-5 w-px transition-colors duration-700 ${inverted ? "bg-ivory/25" : "bg-olive/20"}`}
            />
            <Show when="signed-in">
              <div className="flex items-center gap-6">
                <Link
                  to={dashboardLink}
                  className={`inline-flex items-center gap-2 px-5 py-3 text-[0.75rem] uppercase tracking-[0.2em] transition-colors duration-500 ${
                    inverted
                      ? "border border-ivory/35 text-ivory hover:bg-ivory hover:text-green-forest"
                      : "bg-green text-ivory hover:bg-green-deep"
                  }`}
                >
                  Dashboard
                </Link>
                <UserButton />
              </div>
            </Show>
            <Show when="signed-out">
              <div className="flex items-center gap-6">
                <SignInButton mode="modal">
                  <button
                    className={`link-rule text-[0.8125rem] tracking-[0.06em] transition-colors duration-500 ${
                      inverted
                        ? "text-ivory/85 hover:text-white"
                        : "text-olive/80 hover:text-green"
                    }`}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className={`inline-flex items-center gap-2 px-5 py-3 text-[0.75rem] uppercase tracking-[0.2em] transition-colors duration-500 ${
                      inverted
                        ? "border border-ivory/35 text-ivory hover:bg-ivory hover:text-green-forest"
                        : "bg-green text-ivory hover:bg-green-deep"
                    }`}
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 flex-col items-end justify-center gap-[6px] lg:hidden"
          >
            <span
              className={`h-px transition-all duration-500 ${open ? "w-6 translate-y-[3.5px] rotate-45" : "w-6"} ${
                inverted ? "bg-ivory" : "bg-olive"
              }`}
            />
            <span
              className={`h-px transition-all duration-500 ${open ? "w-6 -translate-y-[3.5px] -rotate-45" : "w-4"} ${
                inverted ? "bg-ivory" : "bg-olive"
              }`}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-ivory px-6 pt-[110px] lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ul className="flex flex-col gap-1 border-t border-olive/10 pt-8">
              {FOOTER_NAV.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.6, ease: EASE }}
                  className="border-b border-olive/10 py-5"
                >
                  {item.href.startsWith('#') ? (
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between font-serif text-3xl font-light text-olive transition-colors duration-500 hover:text-green"
                    >
                      {item.label}
                      <span className="eyebrow text-green">0{i + 1}</span>
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between font-serif text-3xl font-light text-olive transition-colors duration-500 hover:text-green"
                    >
                      {item.label}
                      <span className="eyebrow text-green">0{i + 1}</span>
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero({ dashboardLink }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.03]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[86vh] items-end overflow-hidden bg-olive-deep md:min-h-[96vh]"
    >
      <motion.div
        className="absolute inset-0"
        style={reduce ? {} : { scale, y }}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <img
          src={heroImage}
          alt="Masjid al-Haram in Makkah at dawn, pilgrims gathered around the Kaaba"
          width={1920}
          height={1280}
          className="h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-forest/[0.92] via-olive-deep/[0.58] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-green-forest/[0.70] to-transparent" />
        <div className="absolute inset-0 bg-green-deep/[0.10] mix-blend-multiply" />
      </motion.div>

      <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-16 pt-36 md:px-10 md:pb-20">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <motion.p
              className="eyebrow flex items-center gap-3 text-ivory/70"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
            >
              <motion.span
                aria-hidden
                className="h-px w-8 origin-left bg-ivory"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              />
              Hajj Savings Fund
            </motion.p>

            <motion.h1
              className="display mt-8 text-ivory"
              variants={lineVariants}
              initial="hidden"
              animate="show"
              transition={{ delayChildren: 0.75 }}
            >
              {HEADLINE.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    variants={lineChild}
                    className={`block text-[2.85rem] leading-[1.06] sm:text-6xl md:text-7xl lg:text-[5.4rem] ${
                      line === GREEN_LINE ? "text-green-muted" : ""
                    }`}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            <motion.p
              className="body-copy mt-9 max-w-xl text-ivory/75"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.9, ease: EASE }}
            >
              A structured way for organisations and their employees to set aside contributions for
              Hajj — with clear records, steady progress and quiet confidence.
            </motion.p>

            <motion.div
              className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.9, ease: EASE }}
            >
              <ArrowLink href={dashboardLink} variant="green" isInternal={true}>
                Begin Your Journey
              </ArrowLink>
              <span className="text-ivory">
                <ArrowLink href="#journey" variant="outline">
                  Explore How It Works
                </ArrowLink>
              </span>
            </motion.div>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-5 md:mt-28">
          <motion.span
            aria-hidden
            className="h-px w-24 origin-left bg-brass md:w-40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.1, duration: 1.2, ease: EASE }}
          />
          <motion.span
            className="eyebrow text-ivory/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.9 }}
          >
            For organisations &amp; employees
          </motion.span>
        </div>
      </div>
    </section>
  );
}


/* ------------------------------------------------------------------ */
/* Purpose                                                             */
/* ------------------------------------------------------------------ */

function PurposeSection() {
  return (
    <section id="purpose" className="bg-ivory py-28 md:py-44">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-y-14 px-6 md:px-10">
        <div className="col-span-12 lg:col-span-7">
          <Reveal>
            <p className="mb-8">
              <Eyebrow tone="green">The purpose</Eyebrow>
            </p>
          </Reveal>

          <Reveal>
            <h2 className="display text-[2.35rem] text-olive sm:text-[3.4rem] lg:text-[4rem]">
              Saving for Hajj is more
              <br />
              than a <span className="text-green">financial</span> decision.
              <br />
              <span className="italic text-olive-muted">
                It is preparation for something
                <br />
                deeply personal.
              </span>
            </h2>
          </Reveal>
          <div className="mt-10 w-40">
            <Rule tone="green" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <Reveal delay={0.15}>
            <Eyebrow tone="green">Our purpose</Eyebrow>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="body-copy mt-7 text-charcoal/75">
              Most people who intend to perform Hajj carry that intention for years. What is often
              missing is not sincerity, but structure — a steady, visible way to set money aside and
              know exactly where things stand.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <p className="body-copy mt-6 text-charcoal/75">
              We give organisations and their people a shared framework for that preparation:
              agreed contributions, honest records, and progress that can be seen rather than
              guessed at.
            </p>
          </Reveal>
          <div className="mt-10 w-24">
            <Rule tone="brass" />
          </div>
          <Reveal delay={0.45}>
            <p className="mt-6 font-serif text-xl font-light italic text-olive-muted">
              Hajj Savings
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Journey timeline                                                    */
/* ------------------------------------------------------------------ */

function JourneyTimeline() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="journey" className="geo-veil bg-stone py-28 text-olive md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <Eyebrow tone="green">The journey</Eyebrow>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <Reveal delay={0.1}>
              <h2 className="display text-[2.25rem] sm:text-[2.9rem] lg:text-[3.5rem]">
                A clearer path from intention
                <br className="hidden sm:block" /> to{" "}
                <span className="text-green">preparation</span>.
              </h2>
            </Reveal>
          </div>
        </div>

        <div ref={ref} className="relative mt-20 md:mt-32">
          <div className="pointer-events-none absolute left-0 right-0 top-[3px] hidden md:block">
            <div className="h-px w-full bg-olive/15" />
            <motion.div
              className="h-px w-full origin-left bg-green"
              style={reduce ? {} : { scaleX }}
              aria-hidden
            />
          </div>
          <div className="pointer-events-none absolute bottom-6 left-[3px] top-2 w-px bg-olive/15 md:hidden">
            <motion.div
              className="h-full w-px origin-top bg-green"
              style={reduce ? {} : { scaleY }}
              aria-hidden
            />
          </div>

          <ol className="grid grid-cols-1 gap-12 md:grid-cols-5 md:gap-8">
            {STAGES.map((s, i) => (
              <motion.li
                key={s.label}
                className="group relative pl-9 md:pl-0 md:pt-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
              >
                <motion.span
                  aria-hidden
                  className="absolute left-0 top-[6px] h-[7px] w-[7px] rounded-full bg-olive/25 md:top-0"
                  whileInView={{ backgroundColor: "var(--green)", scale: 1.15 }}
                  viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                />
                <div>
                  <h3 className="text-[0.9375rem] font-medium uppercase tracking-[0.18em] transition-colors duration-500 group-hover:text-green">
                    {s.label}
                  </h3>
                  <p className="mt-3 max-w-[26ch] text-[1rem] font-light leading-relaxed text-olive-muted">
                    {s.note}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ecosystem                                                           */
/* ------------------------------------------------------------------ */

function EcosystemSection() {
  return (
    <section id="ecosystem" className="relative overflow-hidden bg-ivory py-28 md:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-green/12"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <Eyebrow tone="green">How it works</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display mt-7 text-[2.25rem] text-olive sm:text-[2.9rem] lg:text-[3.5rem]">
                Two responsibilities,
                <br />
                one <span className="text-green">shared record</span>.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="body-copy mt-8 max-w-md text-charcoal/70">
                An organisation makes participation possible. The person makes the commitment. The
                fund simply keeps the relationship between them clear, documented and easy to
                follow.
              </p>
            </Reveal>

            <ol className="relative mt-14 max-w-xs border-l border-green/25 pl-6">
              {PATHWAY.map((step, i) => (
                <Reveal as="li" key={step} delay={0.25 + i * 0.08}>
                  <span className="relative block py-3">
                    <span
                      aria-hidden
                      className="absolute -left-[27px] top-[18px] h-[7px] w-[7px] rounded-full bg-green"
                    />
                    <span
                      className={`text-[0.875rem] uppercase tracking-[0.18em] ${
                        i === PATHWAY.length - 1 ? "text-green" : "text-olive/75"
                      }`}

                    >
                      {step}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-1 gap-x-12 gap-y-14 sm:grid-cols-2">
              {SIDES.map((side, si) => (
                <div key={side.title}>
                  <Reveal delay={0.1 + si * 0.1}>
                    <h3 className="font-serif text-[1.9rem] font-light text-olive">
                      {side.title}
                    </h3>
                  </Reveal>
                  <div className="my-5 w-full max-w-[180px]">
                    <Rule tone="green" />
                  </div>
                  <ul className="space-y-4">
                    {side.points.map((p, i) => (
                      <Reveal as="li" key={p} delay={0.2 + i * 0.07}>
                        <span className="flex items-baseline gap-3 text-[1.05rem] font-light text-charcoal/80">
                          <span
                            aria-hidden
                            className="h-[6px] w-[6px] shrink-0 translate-y-[-3px] rounded-full bg-green"
                          />
                          {p}
                        </span>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              ))}
            </div>


            <Reveal delay={0.3}>
              <p className="mt-16 border-t border-green/20 pt-8 font-serif text-2xl font-light italic leading-snug text-olive-muted sm:text-[1.75rem]">
                Participation <span className="text-green">→</span> Contribution{" "}
                <span className="text-green">→</span> Progress
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Organisations & employees                                           */
/* ------------------------------------------------------------------ */

function OrgBlock({ block, delay = 0 }) {
  return (
    <>
      <Reveal delay={delay}>
        <Eyebrow tone="ivory">{block.eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={delay + 0.1}>
        <h2 className="display mt-7 text-[2.4rem] sm:text-[3.4rem] lg:text-[3.9rem]">
          {block.heading[0]}
          <br />
          {block.heading[1]}
        </h2>
      </Reveal>
      <Reveal delay={delay + 0.2}>
        <p className="body-copy mt-7 max-w-md text-ivory/65">{block.body}</p>
      </Reveal>
      <ul className="mt-10 max-w-md">
        {block.items.map((item, i) => (
          <Reveal as="li" key={item} delay={delay + 0.25 + i * 0.07}>
            <span className="flex items-center gap-4 border-b border-ivory/12 py-4 text-[1.05rem] font-light text-ivory/85 transition-colors duration-500 hover:border-green-muted/60">
              <span aria-hidden className="h-[6px] w-[6px] shrink-0 rounded-full bg-green-muted" />
              {item}
            </span>
          </Reveal>
        ))}
      </ul>

    </>
  );
}

function OrganisationEmployeeSection() {
  return (
    <section
      id="organisations"
      className="geo-veil relative overflow-hidden bg-green-forest py-28 text-ivory md:py-44"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-green/40 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-32 h-[520px] w-[520px] border border-green/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[60%] bg-gradient-to-tl from-green-deep/70 to-transparent"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-16 lg:gap-x-16">
          <div className="col-span-12 lg:col-span-6">
            <OrgBlock block={ORG_BLOCK} />
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-24">
            <Reveal>
              <div className="relative overflow-hidden">
                <img
                  src={archesImage}
                  alt="Sunlit stone colonnade of a mosque courtyard"
                  width={1200}
                  height={1504}
                  loading="lazy"
                  className="h-[320px] w-full object-cover object-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] md:h-[420px]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-green-forest/60 to-transparent"
                />
              </div>
            </Reveal>
            <div className="mt-10 w-20">
              <Rule tone="brass" />
            </div>
            <div className="mt-8">
              <OrgBlock block={EMP_BLOCK} delay={0.15} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contribution statement                                              */
/* ------------------------------------------------------------------ */

function ContributionSection() {
  return (
    <section id="clarity" className="bg-ivory py-28 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-14 lg:gap-x-16">
          <div className="col-span-12 lg:col-span-4">
            <Reveal>
              <Eyebrow tone="green">Clarity</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display mt-7 text-[2.35rem] text-olive sm:text-[3.4rem]">
                Know where
                <br />
                you stand.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="body-copy mt-7 max-w-sm text-charcoal/70">
                No guesswork, no vague balances. A plain statement of what has been contributed and
                what remains ahead — the way a serious commitment deserves to be recorded.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-10 text-[0.75rem] uppercase tracking-[0.2em] text-olive-muted">
                Illustrative example
              </p>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <Reveal delay={0.15}>
              <figure className="border border-olive/12 bg-stone/35 p-8 md:p-14">
                <figcaption className="flex items-baseline justify-between border-b border-olive/15 pb-6">
                  <span className="font-serif text-2xl font-light text-olive">
                    Contribution record
                  </span>
                  <span className="eyebrow text-green">Statement</span>
                </figcaption>

                <dl className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="border-b border-olive/12 py-8 sm:border-r sm:pr-10">
                    <dt className="eyebrow text-olive-muted">Monthly contribution</dt>
                    <dd className="mt-4 font-serif text-6xl font-light text-green-deep">£250</dd>
                  </div>
                  <div className="border-b border-olive/12 py-8 sm:pl-10">
                    <dt className="eyebrow text-olive-muted">Contributions made</dt>
                    <dd className="mt-4 font-serif text-6xl font-light text-green-deep">12</dd>
                  </div>
                  <div className="border-b border-olive/12 py-8 sm:border-b-0 sm:border-r sm:pr-10">
                    <dt className="eyebrow text-olive-muted">Progress</dt>
                    <dd className="mt-6 flex flex-wrap gap-[6px]" aria-label="12 of 18 completed">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-[7px] w-[7px] rounded-full ${
                            i < 12 ? "bg-green" : "bg-green/20"
                          }`}
                        />
                      ))}
                    </dd>
                  </div>
                  <div className="py-8 sm:pl-10">
                    <dt className="eyebrow text-olive-muted">Status</dt>
                    <dd className="mt-4 flex items-center gap-3 font-serif text-4xl font-light italic text-green">
                      <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
                      On track
                    </dd>
                  </div>
                </dl>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust                                                               */
/* ------------------------------------------------------------------ */

function TrustSection() {
  return (
    <section id="trust" className="geo-veil bg-green-deep py-28 text-ivory md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-8">
          <div className="col-span-12 md:col-span-4">
            <Reveal>
              <Eyebrow tone="ivory">Trust &amp; governance</Eyebrow>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <Reveal delay={0.1}>
              <h2 className="display text-[2.4rem] sm:text-[3.4rem] lg:text-[3.9rem]">
                Built around trust.
              </h2>
            </Reveal>
          </div>
        </div>

        <ul className="mt-16 border-t border-ivory/12 md:mt-24">
          {PRINCIPLES.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.08}>
              <div className="group grid grid-cols-12 items-start gap-y-5 border-b border-ivory/12 py-10 transition-colors duration-500 hover:bg-green/15 md:gap-x-10 md:py-14">
                <h3 className="col-span-12 font-serif text-[2.1rem] font-light leading-tight transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 md:col-span-5 md:text-[2.6rem]">
                  {p.title}
                </h3>
                <div className="col-span-12 md:col-span-6 md:col-start-7">
                  <span
                    aria-hidden
                    className="mb-5 block h-px w-10 origin-left bg-green-muted transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-[2.6]"
                  />
                  <p className="body-copy text-ivory/60 transition-colors duration-500 group-hover:text-ivory/90">
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCTA({ dashboardLink }) {
  const reduce = useReducedMotion();
  return (
    <section id="final" className="relative overflow-hidden bg-green-forest">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <img
          src={pilgrimsImage}
          alt="Pilgrims walking toward a mosque at golden hour"
          width={1920}
          height={1080}
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-green-forest/78" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-deep/70 via-transparent to-green-forest/60" />
      </motion.div>

      <div className="relative mx-auto max-w-[1440px] px-6 py-32 md:px-10 md:py-52">
        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3 lg:text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <Eyebrow tone="ivory">Begin</Eyebrow>
            </motion.div>

            <motion.h2
              className="display mt-8 text-[2.4rem] text-ivory sm:text-6xl lg:text-[4.25rem]"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: EASE }}
            >
              Make the preparation
              <br />
              part of the journey.
            </motion.h2>

            <motion.p
              className="body-copy mx-auto mt-8 max-w-xl text-ivory/70"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
            >
              A structured way for organisations and their people to prepare for Hajj with clarity
              and confidence.
            </motion.p>

            <motion.div
              className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            >
              <ArrowLink href="#top" variant="ivory">
                Begin Your Journey
              </ArrowLink>

              <span className="text-ivory">
                <ArrowLink href={dashboardLink} variant="outline">
                  Portal Login
                </ArrowLink>
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer({ dashboardLink }) {
  return (
    <footer className="geo-veil bg-green-forest py-20 text-ivory md:py-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <p className="font-serif text-3xl font-light tracking-[0.3em]">HAJJ SAVINGS</p>
            <p className="mt-3 text-[0.625rem] uppercase tracking-[0.3em] text-ivory/55">
              Hajj Savings Fund
            </p>
            <span aria-hidden className="mt-8 block h-px w-16 bg-green-muted" />
            <p className="mt-8 max-w-xs text-sm font-light leading-relaxed text-ivory/50">
              A structured approach to Hajj savings.
            </p>
          </div>

          {[
            { title: "Navigate", items: FOOTER_NAV, cls: "md:col-span-4 md:col-start-9" },
          ].map((group) => (
            <div key={group.title} className={`col-span-6 ${group.cls}`}>
              <p className="eyebrow text-ivory/40">{group.title}</p>
              <ul className="mt-6 space-y-3">
                {group.items.map((i) => (
                  <li key={i.label}>
                    <a
                      href={i.href}
                      className="link-rule text-[0.95rem] font-light text-ivory/75 transition-colors duration-500 hover:text-green-muted"
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-ivory/12 pt-8 text-[0.6875rem] uppercase tracking-[0.16em] text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Hajj Savings Fund. All rights reserved.</p>
          <p>A structured approach to Hajj savings.</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const [dashboardLink, setDashboardLink] = useState('/dashboard');

  useEffect(() => {
    if (isLoaded && user) {
      if (user.publicMetadata.role === 'superadmin') {
        setDashboardLink('/superadmin');
      } else if (user.publicMetadata.role === 'admin') {
        setDashboardLink('/org-admin');
      }
    }
  }, [isLoaded, user]);

  return (
    <>
      <Navbar dashboardLink={dashboardLink} />
      <main>
        <Hero dashboardLink={dashboardLink} />
        <PurposeSection />
        <JourneyTimeline />
        <EcosystemSection />
        <OrganisationEmployeeSection />
        <ContributionSection />
        <TrustSection />
        <FinalCTA dashboardLink={dashboardLink} />
      </main>
      <Footer dashboardLink={dashboardLink} />
    </>
  );
}
