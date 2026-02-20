import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FundraiserEvent } from "@/types";
import { cn } from "@/lib/utils";

interface EventCalendarProps {
  events: FundraiserEvent[];
  title: string;
  description: string;
  className?: string;
  onNavigateToEvent?: (eventId: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GRID_SIZE = 42;

export function EventCalendar({ events, title, description, className, onNavigateToEvent }: EventCalendarProps) {
  const [monthAnchor, setMonthAnchor] = useState<Date>(() => getInitialAnchor(events));
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => {
    const firstEvent = events[0]?.date?.split("T")[0];
    return firstEvent ?? toIsoDate(new Date());
  });

  const eventsByDay = useMemo(() => {
    return events.reduce<Record<string, FundraiserEvent[]>>((accumulator, event) => {
      const day = event.date.split("T")[0];
      if (!accumulator[day]) {
        accumulator[day] = [];
      }
      accumulator[day].push(event);
      return accumulator;
    }, {});
  }, [events]);

  const monthCells = useMemo(() => buildMonthCells(monthAnchor), [monthAnchor]);
  const selectedDayEvents = eventsByDay[selectedIsoDate] ?? [];

  return (
    <Card className={cn("glass-surface", className)}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setMonthAnchor((current) => shiftMonth(current, -1))} type="button">
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <p className="font-display text-xl text-slate-900">
            {monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          <Button variant="outline" size="sm" onClick={() => setMonthAnchor((current) => shiftMonth(current, 1))} type="button">
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="pb-1 text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {day}
            </div>
          ))}

          {monthCells.map((cellDate) => {
            const isoDate = toIsoDate(cellDate);
            const dayEvents = eventsByDay[isoDate] ?? [];
            const inCurrentMonth = cellDate.getMonth() === monthAnchor.getMonth();
            const isSelected = selectedIsoDate === isoDate;
            const isToday = isoDate === toIsoDate(new Date());

            return (
              <button
                key={isoDate}
                type="button"
                onClick={() => setSelectedIsoDate(isoDate)}
                className={cn(
                  "relative min-h-[4.5rem] rounded-xl border p-2 text-left transition",
                  inCurrentMonth ? "border-slate-200 bg-white" : "border-transparent bg-slate-100/60",
                  dayEvents.length ? "border-emerald-300/70" : "",
                  isSelected ? "ring-2 ring-emerald-600" : "",
                )}
              >
                <p className={cn("text-xs font-semibold", inCurrentMonth ? "text-slate-700" : "text-slate-400")}>
                  {cellDate.getDate()}
                </p>
                {isToday ? <span className="text-[0.6rem] uppercase tracking-[0.15em] text-emerald-700">Today</span> : null}
                {dayEvents.length ? (
                  <Badge className="absolute bottom-2 right-2 rounded-full bg-emerald-100 text-emerald-700">
                    {dayEvents.length}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
            {toDisplayDate(selectedIsoDate)}
          </p>
          {!selectedDayEvents.length ? (
            <p className="mt-2 text-sm text-slate-500">No events scheduled for this day.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {selectedDayEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={cn(
                    "rounded-xl border border-emerald-200 bg-emerald-50/40 p-3",
                    onNavigateToEvent && "cursor-pointer transition-colors hover:bg-emerald-100/50"
                  )}
                  onClick={onNavigateToEvent ? () => onNavigateToEvent(event.id) : undefined}
                >
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-600">{event.venue}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getInitialAnchor(events: FundraiserEvent[]): Date {
  if (!events.length) {
    return new Date();
  }

  return new Date(events[0].date);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDisplayDate(isoDate: string): string {
  const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return isoDate;
  }
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function shiftMonth(date: Date, by: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + by, 1);
}

function buildMonthCells(anchor: Date): Date[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: GRID_SIZE }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
