import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FlaskConical, Shield, Clock, MessageSquare, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <FlaskConical className="h-6 w-6" />,
    title: "Choose Your Lab",
    description: "Browse verified diagnostic labs, compare prices, and pick the one that fits your needs.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Home Collection",
    description: "Book a sample collector to visit your home at your preferred date and time.",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Real-time Chat",
    description: "Chat directly with lab technicians about your tests and results.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Track Everything",
    description: "Follow your sample from collection to report — no middlemen, full transparency.",
  },
];

export default function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero px-4 py-24 md:py-32">
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary-foreground/90">
              <FlaskConical className="h-4 w-4" />
              Healthcare, simplified
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              Diagnostics Without the{" "}
              <span className="text-secondary">Middlemen</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-primary-foreground/70 md:text-xl">
              Book lab tests directly, get samples collected at home, chat with technicians, and download reports — all in one place.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold px-8">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/labs">
                <Button size="lg" variant="outline" className="gap-2 text-base font-semibold px-8">
                  Browse Labs
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground">How It Works</h2>
          <p className="text-muted-foreground">Four simple steps to better healthcare</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                {f.icon}
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl gradient-primary p-8 text-center md:p-12">
          <h2 className="mb-3 font-display text-2xl font-bold text-primary-foreground md:text-3xl">
            Ready to take control of your health?
          </h2>
          <p className="mb-6 text-primary-foreground/70">
            Join thousands of patients using DirectLab for transparent diagnostics.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="gap-2 font-semibold px-8">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
  <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 text-center">
    <div className="flex items-center gap-2">
      <FlaskConical className="h-5 w-5 text-secondary" />
      <span className="font-display font-semibold text-foreground">
        DirectLab
      </span>
    </div>
    <p className="text-sm text-muted-foreground">
      © 2026 DirectLab. All rights reserved.
    </p>
  </div>
</footer>
    </div>
  );
}
