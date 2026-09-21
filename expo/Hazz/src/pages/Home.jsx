import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/hero-makkah.png";
import pilgrimsImage from "../assets/pilgrims.png";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const NAV = [
  { label: "About", href: "#purpose" },
  { label: "How It Works", href: "#journey" },
  { label: "Fund Structure", href: "#structure" },
  { label: "Governance", href: "#governance" },
];

const STAGES = [
  { label: "Eligibility", note: "Staff, directors and approved long-term volunteers." },
  { label: "Participation", note: "Contributions continue monthly or annually." },
  { label: "Contribution", note: "Employer, employee and community support." },
  { label: "Annual draw", note: "Transparent selection based on fund capacity." },
  { label: "Sacred journey", note: "Three people supported each year." },
];

const SIDES = [
  { title: "Organisation", points: ["Fixed yearly contribution", "Holds protected records", "Runs the annual draw", "Reports and audits annually"] },
  { title: "Employee", points: ["Monthly or yearly participation", "Maintains continuous contributions", "Reviews their contribution record", "Remains eligible until selected"] },
];

const PRINCIPLES = [
  { title: "Protection", body: "Financial and personal records cannot be altered or deleted during any investigation." },
  { title: "Transparency", body: "The selection process is fully transparent, auditable and reported annually." },
  { title: "Governance", body: "The Hajj Fund Committee includes the CEO, Directors, Finance and HR." },
  { title: "Purpose", body: "Every contribution remains strictly reserved for Hajj and cannot be withdrawn for another use." },
];

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }) {
  return <div className="eyebrow"><span />{children}</div>;
}

function ArrowLink({ href, children, solid = false, to = null }) {
  const cls = solid ? "arrow-link arrow-solid" : "arrow-link arrow-outline";
  const arrow = <ArrowRight size={15} strokeWidth={1.5} />;

  if (to) {
    return <Link to={to} className={cls}>{children}{arrow}</Link>;
  }
  return <a href={href} className={cls}>{children}{arrow}</a>;
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar({ dashboardLink }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <Link to="/" className="wordmark">
          <b>HAJJ SAVINGS</b>
          <small>HAJJ SAVINGS FUND</small>
        </Link>

        <nav className="desktop-nav">
          {NAV.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
          <span className="nav-divider" />

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button>Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="nav-action">SIGN UP</button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link to={dashboardLink} className="nav-action">Dashboard</Link>
            <UserButton />
          </Show>
        </nav>

        <button
          className="menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <div className={`mobile-menu ${open ? "is-open" : ""}`}>
        {NAV.map((item, index) => (
          <a key={item.label} href={item.href} onClick={() => setOpen(false)}>
            <span>{item.label}</span>
            <small>0{index + 1}</small>
          </a>
        ))}
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="mobile-link" onClick={() => setOpen(false)}>
              <span>Sign In</span><small>LOGIN</small>
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="mobile-link" onClick={() => setOpen(false)} style={{ color: "var(--gold)" }}>
              <span>Sign Up</span><small>JOIN</small>
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link to={dashboardLink} onClick={() => setOpen(false)}>
            <span>Dashboard</span><small>APP</small>
          </Link>
        </Show>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ dashboardLink }) {
  return (
    <section className="hero" id="top">
      <img src={heroImage} alt="The Holy Kaaba at dusk" width={1920} height={1088} />
      <div className="hero-shade" />
      <div className="hero-content reveal visible">
        <Eyebrow>Hajj Savings Fund</Eyebrow>
        <h1 className="type-rise">
          <span>Prepare today</span>
          <span>for a journey</span>
          <span><em>that matters.</em></span>
        </h1>
        <p>A long-term, ethical and Sharia-compliant fund helping employees fulfil the sacred obligation of Hajj.</p>
        <div className="hero-actions">
          <ArrowLink href="#purpose" solid>Discover the fund</ArrowLink>
          <ArrowLink href="#journey">Explore how it works</ArrowLink>
        </div>
      </div>
      <div className="hero-foot">
        <span />
        <p>For organisations &amp; employees</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Purpose                                                             */
/* ------------------------------------------------------------------ */

function Purpose() {
  return (
    <section className="purpose page-section" id="purpose">
      <div className="section-grid">
        <div className="purpose-statement reveal">
          <Eyebrow>The purpose</Eyebrow>
          <h2>
            Saving for Hajj is more<br />
            than a financial decision.<br />
            <em>It is preparation for<br />something deeply personal.</em>
          </h2>
          <span className="short-rule" />
        </div>
        <div className="purpose-copy reveal">
          <Eyebrow>About the fund</Eyebrow>
          <p>
            The Hajj Savings Fund is a long-term, ethical, and Sharia-compliant initiative
            established to support employees in fulfilling the sacred obligation of Hajj.
          </p>
          <p>
            Rooted in our commitment to holistic employee welfare, it uses a sustainable
            employer-employee contribution model designed for fairness, transparency and
            lasting accessibility.
          </p>
          <span className="short-rule" />
          <em>Service · Integrity · Empowerment</em>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Journey                                                             */
/* ------------------------------------------------------------------ */

function Journey() {
  return (
    <section className="journey patterned page-section" id="journey">
      <div className="journey-head reveal">
        <Eyebrow>The journey</Eyebrow>
        <h2>
          A clearer path from intention<br />
          to <em>fulfilment.</em>
        </h2>
      </div>
      <div className="timeline reveal">
        <div className="timeline-line" />
        {STAGES.map((stage, index) => (
          <article key={stage.label} style={{ "--delay": `${index * 110}ms` }}>
            <i />
            <span className="stage-number">0{index + 1}</span>
            <h3>{stage.label}</h3>
            <p>{stage.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Structure                                                           */
/* ------------------------------------------------------------------ */

function Structure() {
  return (
    <section className="structure page-section" id="structure">
      <div className="structure-grid">
        <div className="structure-intro reveal">
          <Eyebrow>Fund structure</Eyebrow>
          <h2>
            Two contributions,<br />
            one <em>sacred purpose.</em>
          </h2>
          <p>
            The organisation creates the foundation. Each participating employee builds on it.
            The fund keeps every contribution clear, protected and accountable.
          </p>
          <div className="pathway">
            {["Employer", "Participation", "Employee", "Contribution", "Hajj draw"].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </div>
        <div className="roles reveal">
          {SIDES.map((side) => (
            <article key={side.title}>
              <h3>{side.title}</h3>
              <ul>
                {side.points.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
          <p className="roles-note">
            Participation <b>→</b> Contribution <b>→</b> Hajj
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contribution model                                                  */
/* ------------------------------------------------------------------ */

function Contribution() {
  return (
    <section className="contribution patterned" id="model">
      <div className="contribution-left reveal">
        <Eyebrow>The model</Eyebrow>
        <h2>
          Built to grow,<br />
          year after year.
        </h2>
        <p>
          A consistent contribution framework creates meaningful annual capacity
          without compromising fairness.
        </p>
        <ul>
          <li>12 participating organisations</li>
          <li>$2,000 from each organisation</li>
          <li>$15,000 employee contribution</li>
          <li>10% uplift per annum</li>
        </ul>
      </div>
      <div className="model-panel reveal">
        <span className="model-kicker">Annual fund capacity</span>
        <strong>$39,000</strong>
        <div className="sum">
          <span>$24,000<br /><small>Organisation contributions</small></span>
          <b>+</b>
          <span>$15,000<br /><small>Employee contributions</small></span>
        </div>
        <div className="model-outcome">
          <strong>3</strong>
          <span>people supported<br />every year</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Eligibility                                                         */
/* ------------------------------------------------------------------ */

function Eligibility() {
  return (
    <section className="eligibility patterned">
      <div className="eligibility-empty" />
      <div className="eligibility-copy reveal">
        <Eyebrow>Eligibility &amp; conditions</Eyebrow>
        <h2>
          Designed around<br />
          our people.
        </h2>
        <p>
          The fund remains inclusive while protecting the commitment that makes
          long-term support possible.
        </p>
        <ul>
          <li>All staff and directors</li>
          <li>Approved long-term volunteers</li>
          <li>Departed members who continue contributing</li>
          <li>Previous winners excluded from future draws</li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Governance                                                          */
/* ------------------------------------------------------------------ */

function GovernanceSection() {
  return (
    <section className="governance patterned page-section" id="governance">
      <div className="governance-head reveal">
        <Eyebrow>Trust &amp; governance</Eyebrow>
        <h2>Built around trust.</h2>
      </div>
      <div className="principles">
        {PRINCIPLES.map((p, i) => (
          <article className={`reveal ${i % 2 === 0 ? "highlight" : ""}`} key={p.title}>
            <h3>{p.title}</h3>
            <div>
              <span />
              <p>{p.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA + Footer                                                  */
/* ------------------------------------------------------------------ */

function FinalCall({ dashboardLink }) {
  return (
    <>
      <section className="final-cta" id="final">
        <img
          src={pilgrimsImage}
          alt="Pilgrims walking toward a mosque at golden hour"
          width={1920}
          height={1080}
          loading="lazy"
        />
        <div className="final-shade" />
        <div className="final-copy reveal">
          <Eyebrow>The opportunity</Eyebrow>
          <h2>
            Make the sacred journey<br />
            part of how we care.
          </h2>
          <p>
            A sustainable programme of welfare, spiritual uplift and lasting
            organisational loyalty.
          </p>
          <div>
            <ArrowLink href="#purpose" solid>Review the purpose</ArrowLink>
            <ArrowLink href="#governance">View governance</ArrowLink>
          </div>
        </div>
      </section>

      <footer className="patterned">
        <div className="footer-main">
          <div>
            <Link to="/" className="wordmark footer-mark">
              <b>HAJJ SAVINGS</b>
              <small>HAJJ SAVINGS FUND</small>
            </Link>
            <span className="short-rule" />
            <p>A spiritually enriching welfare programme.</p>
          </div>
          <div>
            <Eyebrow>Navigate</Eyebrow>
            {NAV.map((item) => (
              <a href={item.href} key={item.label}>{item.label}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Hajj Savings Fund. All rights reserved.</span>
          <span>Service · Integrity · Empowerment</span>
        </div>
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const dashboardLink = "/dashboard";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Reveal-on-scroll observer — exactly as the reference does it
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <Navbar dashboardLink={dashboardLink} />
      <Hero dashboardLink={dashboardLink} />
      <Purpose />
      <Journey />
      <Structure />
      <Contribution />
      <Eligibility />
      <GovernanceSection />
      <FinalCall dashboardLink={dashboardLink} />
    </main>
  );
}
