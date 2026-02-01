"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Search, Plane } from "lucide-react";
import { Header, HeaderAction } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { EmptyState } from "@/components/common";

// Placeholder data - will be replaced with actual data fetching
const mockTrips: Array<{
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  status: "planning" | "ongoing" | "completed";
  coverImage?: string;
}> = [];

export default function TripsPage() {
  const t = useTranslations();
  const [trips] = useState(mockTrips);

  const getStatusBadge = (status: string) => {
    const styles = {
      planning: "bg-primary-light text-primary",
      ongoing: "bg-secondary-light text-secondary",
      completed: "bg-surface text-text-secondary",
    };
    return styles[status as keyof typeof styles] || styles.planning;
  };

  return (
    <>
      <Header
        title={t("trip.myTrips")}
        rightAction={
          <HeaderAction
            icon={<Search className="w-5 h-5" />}
            onClick={() => console.log("Search")}
          />
        }
      />

      <main className="px-4 py-4">
        {trips.length === 0 ? (
          <EmptyState
            icon={<Plane className="w-16 h-16" />}
            title={t("trip.noTrips")}
            description={t("trip.noTripsDescription")}
            action={{
              label: t("trip.createTrip"),
              onClick: () => console.log("Create trip"),
            }}
          />
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card hoverable className="overflow-hidden">
                  {trip.coverImage && (
                    <div className="h-32 bg-surface -mx-4 -mt-4 mb-4">
                      <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {trip.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {trip.destination}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {trip.startDate} ~ {trip.endDate}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        trip.status
                      )}`}
                    >
                      {t(`trip.status.${trip.status}`)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Link href="/trips/new">
          <Button
            className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg"
            aria-label={t("trip.createTrip")}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </main>
    </>
  );
}
