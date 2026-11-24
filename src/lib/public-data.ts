import "server-only";
import { and, asc, eq, gte, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { events, participatingCompanies } from "@/db/schema";

export type PublicEvent = {
  id: string; slug: string; name: string; description: string | null;
  startsAt: Date; endsAt: Date | null; locationName: string | null; city: string;
  imageUrl: string | null; imageAlt: string | null; status: string;
};

export async function getUpcomingEvents(): Promise<PublicEvent[]> {
  if (!db) return [];
  try {
    return await db.select({
      id: events.id, slug: events.slug, name: events.name, description: events.description,
      startsAt: events.startsAt, endsAt: events.endsAt, locationName: events.locationName, city: events.city,
      imageUrl: events.imageUrl, imageAlt: events.imageAlt, status: events.status,
    }).from(events)
      .where(and(isNotNull(events.publishedAt), gte(events.startsAt, new Date()), ne(events.status, "cancelado")))
      .orderBy(asc(events.startsAt)).limit(6);
  } catch {
    return [];
  }
}

export type PublicCompany = { id: string; name: string; segment: string | null; logoUrl: string | null; instagram: string | null; website: string | null };

export async function getParticipatingCompanies(): Promise<PublicCompany[]> {
  if (!db) return [];
  try {
    return await db.select({
      id: participatingCompanies.id, name: participatingCompanies.name, segment: participatingCompanies.segment,
      logoUrl: participatingCompanies.logoUrl, instagram: participatingCompanies.instagram, website: participatingCompanies.website,
    }).from(participatingCompanies).where(eq(participatingCompanies.active, true)).orderBy(asc(participatingCompanies.sortOrder), asc(participatingCompanies.name));
  } catch {
    return [];
  }
}
