import { Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { AboutHeading } from "@/components/about/about-heading";
import { teamBlock } from "@/content/about";

export function TeamGrid() {
  const members = teamBlock.items.filter((m) => m.visible).sort((a, b) => a.order - b.order);
  if (!teamBlock.visible || members.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <AboutHeading heading={teamBlock.heading} subheading={teamBlock.subheading} />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => (
          <Reveal as="li" key={member.id} delay={i * 60} className="min-w-0">
            <article className="h-full overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={member.image}
                alt={member.imageAlt}
                width={800}
                height={800}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="p-5">
                <h3 className="text-base font-bold">{member.name}</h3>
                <p className="text-sm font-medium text-primary">{member.designation}</p>
                <p className="mt-2 text-sm text-muted-foreground">{member.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  {member.phone ? (
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <span>Call {member.name.split(" ")[0]}</span>
                    </a>
                  ) : null}
                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span>Email</span>
                    </a>
                  ) : null}
                  {member.socials?.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted-foreground hover:text-primary"
                      aria-label={`${member.name} on ${s.label}`}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
