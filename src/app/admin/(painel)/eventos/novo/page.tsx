import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Novo evento" };

export default async function NewEventPage() {
  await requireUser("eventos");
  return (
    <>
      <Link className="adm-back" href="/admin/eventos"><ArrowLeft size={16} />Eventos</Link>
      <div className="adm-head"><div><h1>Novo evento</h1><p>O evento é salvo como rascunho. Publique quando quiser que apareça no site.</p></div></div>
      <div className="adm-card" style={{ maxWidth: 920 }}>
        <EventForm values={{ name: "", description: "", startsAt: "", endsAt: "", locationName: "", address: "", city: "Frutal/MG", status: "agendado", imageUrl: null, imageAlt: "" }} />
      </div>
    </>
  );
}
