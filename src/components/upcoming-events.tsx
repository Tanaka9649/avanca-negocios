import { CalendarClock, MapPin } from "lucide-react";
import { WhatsappLink } from "@/components/whatsapp-link";
import type { PublicEvent } from "@/lib/public-data";

const TZ = "America/Sao_Paulo";
const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: TZ });
const month = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: TZ });
const weekdayTime = new Intl.DateTimeFormat("pt-BR", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: TZ });

const STATUS: Record<string, string | null> = { agendado: null, vagas_limitadas: "Vagas limitadas", encerrado: "Encerrado", cancelado: "Cancelado" };

export function UpcomingEvents({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section className="ev-events" id="encontros" aria-labelledby="encontros-title">
      <div className="wrap">
        <h2 id="encontros-title" className="h2">Próximos encontros.</h2>
        <ul className="events">
          {events.map((ev) => {
            const status = STATUS[ev.status];
            const when = weekdayTime.format(ev.startsAt);
            return (
              <li key={ev.id} className="event">
                <div className="event__date">
                  <span className="event__day">{day.format(ev.startsAt)}</span>
                  <span className="event__month">{month.format(ev.startsAt)}</span>
                </div>
                <div>
                  <h3 className="h3">{ev.name}{status && <span className="event__status">{status}</span>}</h3>
                  {ev.description && <p className="body" style={{ marginTop: 8 }}>{ev.description}</p>}
                  <p className="event__meta">
                    <span><CalendarClock size={16} aria-hidden="true" />{when.charAt(0).toUpperCase() + when.slice(1)}</span>
                    <span><MapPin size={16} aria-hidden="true" />{[ev.locationName, ev.city].filter(Boolean).join(", ")}</span>
                  </p>
                </div>
                {ev.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="event__img" src={ev.imageUrl} alt={ev.imageAlt ?? `Divulgação de ${ev.name}`} loading="lazy" />
                ) : <span />}
                <WhatsappLink context="eventos" eventId={ev.id} extra={`Tenho interesse no encontro "${ev.name}".`} className="btn btn--ink">
                  Tenho interesse
                </WhatsappLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
