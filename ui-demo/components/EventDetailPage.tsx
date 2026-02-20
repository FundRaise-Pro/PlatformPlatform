import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Download,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Share2,
  UserCheck,
  Users,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FundraiserConfig, FundraiserEvent, EventRsvp, EventRsvpStatus, Partner, Volunteer } from "@/types";

interface EventDetailPageProps {
  event: FundraiserEvent;
  config: FundraiserConfig;
  onUpdate: (updates: Partial<FundraiserConfig>) => void;
  onBack: () => void;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const RSVP_STATUS_COLOR_MAP: Record<EventRsvpStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  waitlisted: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- QR Code Section ---

function QrCodeCanvas({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Simple QR-code-style pattern using canvas
    // In production, use a proper QR library – this renders a stylised placeholder
    const cellSize = Math.floor(size / 25);
    const modules = 25;
    canvas.width = cellSize * modules;
    canvas.height = cellSize * modules;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";

    // Deterministic pattern based on input string
    const seed = Array.from(value).reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

    // Draw finder patterns (top-left, top-right, bottom-left)
    const drawFinderPattern = (startX: number, startY: number) => {
      for (let row = 0; row < 7; row++) {
        for (let column = 0; column < 7; column++) {
          const isOuter = row === 0 || row === 6 || column === 0 || column === 6;
          const isInner = row >= 2 && row <= 4 && column >= 2 && column <= 4;
          if (isOuter || isInner) {
            context.fillRect((startX + column) * cellSize, (startY + row) * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(modules - 7, 0);
    drawFinderPattern(0, modules - 7);

    // Fill data area with deterministic pattern
    for (let row = 0; row < modules; row++) {
      for (let column = 0; column < modules; column++) {
        const inFinderZone =
          (row < 8 && column < 8) ||
          (row < 8 && column >= modules - 8) ||
          (row >= modules - 8 && column < 8);
        if (inFinderZone) continue;
        const hash = ((seed * (row + 1) * 31 + (column + 1) * 37) % 100);
        if (hash < 45) {
          context.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className="rounded-lg border" />;
}

function EventQrCodeSection({ event, config }: { event: FundraiserEvent; config: FundraiserConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const publicUrl = `${window.location.origin}/#/public/events/${event.id}`;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQrCode = () => {
    // Find the canvas inside the QrCodeCanvas component
    const card = canvasRef.current?.closest("[data-qr-card]");
    const canvas = card?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShareWhatsApp = () => {
    const text = `Join us at ${event.title}! RSVP here: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Card data-qr-card ref={canvasRef as unknown as React.RefObject<HTMLDivElement>}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-5" />
          QR code & sharing
        </CardTitle>
        <CardDescription>Share this event with attendees and on social media</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <QrCodeCanvas value={publicUrl} size={200} />
          <div className="flex flex-1 flex-col gap-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Public event link</Label>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="size-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadQrCode}>
                <Download className="size-4" />
                Download QR
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
                <Share2 className="size-4" />
                Share via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Timetable Section ---

function EventTimetableSection({
  event,
  onUpdateEvent,
}: {
  event: FundraiserEvent;
  onUpdateEvent: (updatedEvent: FundraiserEvent) => void;
}) {
  const [newTime, setNewTime] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSpeaker, setNewSpeaker] = useState("");

  const timetable = event.timetable ?? [];

  const handleAddEntry = () => {
    if (!newTime || !newLabel) return;
    const newEntry = {
      id: `tte-${Date.now()}`,
      time: newTime,
      label: newLabel,
      speaker: newSpeaker || undefined,
    };
    onUpdateEvent({
      ...event,
      timetable: [...timetable, newEntry],
    });
    setNewTime("");
    setNewLabel("");
    setNewSpeaker("");
  };

  const handleRemoveEntry = (entryId: string) => {
    onUpdateEvent({
      ...event,
      timetable: timetable.filter((entry) => entry.id !== entryId),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Timetable
        </CardTitle>
        <CardDescription>Manage the event schedule and programme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {timetable.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[6.25rem]">Time</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Speaker</TableHead>
                <TableHead className="w-[5rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetable.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">{entry.time}</TableCell>
                  <TableCell>{entry.label}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.speaker ?? "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveEntry(entry.id)}
                    >
                      ✕
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No timetable entries yet. Add your first activity below.
          </div>
        )}
        <Separator />
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Time</Label>
            <Input
              value={newTime}
              onChange={(event) => setNewTime(event.target.value)}
              placeholder="09:00"
              className="w-[6.25rem]"
            />
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1">
            <Label className="text-xs">Activity</Label>
            <Input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Registration & Welcome"
            />
          </div>
          <div className="min-w-[8rem] space-y-1">
            <Label className="text-xs">Speaker (optional)</Label>
            <Input
              value={newSpeaker}
              onChange={(event) => setNewSpeaker(event.target.value)}
              placeholder="John Doe"
            />
          </div>
          <Button onClick={handleAddEntry} disabled={!newTime || !newLabel} size="sm">
            Add entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Volunteers Section ---

function EventVolunteersSection({
  event,
  volunteers,
  onUpdateEvent,
}: {
  event: FundraiserEvent;
  volunteers: Volunteer[];
  onUpdateEvent: (updatedEvent: FundraiserEvent) => void;
}) {
  const assignedVolunteerIds = event.volunteerIds ?? [];
  const assignedVolunteers = volunteers.filter((volunteer) => assignedVolunteerIds.includes(volunteer.id));
  const availableVolunteers = volunteers.filter(
    (volunteer) => !assignedVolunteerIds.includes(volunteer.id) && volunteer.status === "available"
  );

  const handleAssignVolunteer = (volunteerId: string) => {
    onUpdateEvent({
      ...event,
      volunteerIds: [...assignedVolunteerIds, volunteerId],
    });
  };

  const handleRemoveVolunteer = (volunteerId: string) => {
    onUpdateEvent({
      ...event,
      volunteerIds: assignedVolunteerIds.filter((id) => id !== volunteerId),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Volunteers
        </CardTitle>
        <CardDescription>
          {assignedVolunteers.length} assigned · {availableVolunteers.length} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignedVolunteers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Assigned volunteers</Label>
            <div className="flex flex-wrap gap-2">
              {assignedVolunteers.map((volunteer) => (
                <Badge key={volunteer.id} variant="secondary" className="gap-1 pr-1">
                  {volunteer.fullName}
                  <button
                    onClick={() => handleRemoveVolunteer(volunteer.id)}
                    className="text-muted-foreground hover:text-destructive ml-1 cursor-pointer rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        {availableVolunteers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Add volunteer</Label>
            <Select onValueChange={handleAssignVolunteer}>
              <SelectTrigger className="w-[15rem]">
                <SelectValue placeholder="Select a volunteer..." />
              </SelectTrigger>
              <SelectContent>
                {availableVolunteers.map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.fullName} — {volunteer.skills}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {assignedVolunteers.length === 0 && availableVolunteers.length === 0 && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No volunteers available. Add volunteers in the Operations tab first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Participants / RSVPs Section ---

function EventParticipantsSection({
  event,
  onUpdateEvent,
}: {
  event: FundraiserEvent;
  onUpdateEvent: (updatedEvent: FundraiserEvent) => void;
}) {
  const [newAttendeeName, setNewAttendeeName] = useState("");
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");
  const [newAttendeePhone, setNewAttendeePhone] = useState("");

  const rsvps = event.rsvps ?? [];
  const confirmedCount = rsvps.filter((rsvp) => rsvp.status === "confirmed").length;
  const waitlistedCount = rsvps.filter((rsvp) => rsvp.status === "waitlisted").length;

  const handleAddRsvp = () => {
    if (!newAttendeeName) return;
    const isOverCapacity = event.capacity ? confirmedCount >= event.capacity : false;
    const newRsvp: EventRsvp = {
      id: `rsvp-${Date.now()}`,
      attendeeName: newAttendeeName,
      email: newAttendeeEmail || undefined,
      phone: newAttendeePhone || undefined,
      source: "site",
      status: isOverCapacity ? "waitlisted" : "confirmed",
      timestamp: new Date().toISOString(),
    };
    onUpdateEvent({
      ...event,
      rsvps: [...rsvps, newRsvp],
      rsvpCount: (event.rsvpCount ?? 0) + 1,
    });
    setNewAttendeeName("");
    setNewAttendeeEmail("");
    setNewAttendeePhone("");
  };

  const handleUpdateRsvpStatus = (rsvpId: string, newStatus: EventRsvpStatus) => {
    onUpdateEvent({
      ...event,
      rsvps: rsvps.map((rsvp) => (rsvp.id === rsvpId ? { ...rsvp, status: newStatus } : rsvp)),
    });
  };

  const handleRemoveRsvp = (rsvpId: string) => {
    onUpdateEvent({
      ...event,
      rsvps: rsvps.filter((rsvp) => rsvp.id !== rsvpId),
      rsvpCount: Math.max(0, (event.rsvpCount ?? 0) - 1),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="size-5" />
          Participants & RSVPs
        </CardTitle>
        <CardDescription>
          {confirmedCount} confirmed · {waitlistedCount} waitlisted
          {event.capacity ? ` · ${event.capacity} capacity` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.capacity && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Capacity usage</span>
              <span className="font-medium">
                {confirmedCount} / {event.capacity}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, (confirmedCount / event.capacity) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {rsvps.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[5rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell className="font-medium">{rsvp.attendeeName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {rsvp.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" /> {rsvp.email}
                      </span>
                    )}
                    {rsvp.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" /> {rsvp.phone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {rsvp.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={rsvp.status}
                      onValueChange={(value) => handleUpdateRsvpStatus(rsvp.id, value as EventRsvpStatus)}
                    >
                      <SelectTrigger className="h-7 w-[7.5rem] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveRsvp(rsvp.id)}
                    >
                      ✕
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-medium">Add participant</Label>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1 space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                value={newAttendeeName}
                onChange={(event) => setNewAttendeeName(event.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="min-w-[10rem] space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                value={newAttendeeEmail}
                onChange={(event) => setNewAttendeeEmail(event.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="min-w-[8rem] space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input
                value={newAttendeePhone}
                onChange={(event) => setNewAttendeePhone(event.target.value)}
                placeholder="+27 82 000 0000"
              />
            </div>
            <Button onClick={handleAddRsvp} disabled={!newAttendeeName} size="sm">
              Add RSVP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Partners Section ---

function EventPartnersSection({
  event,
  partners,
  onUpdateEvent,
}: {
  event: FundraiserEvent;
  partners: Partner[];
  onUpdateEvent: (updatedEvent: FundraiserEvent) => void;
}) {
  const assignedPartnerIds = event.partnerIds ?? [];
  const assignedPartners = partners.filter((partner) => assignedPartnerIds.includes(partner.id));
  const availablePartners = partners.filter(
    (partner) => !assignedPartnerIds.includes(partner.id) && partner.status === "active"
  );

  const handleAssignPartner = (partnerId: string) => {
    onUpdateEvent({
      ...event,
      partnerIds: [...assignedPartnerIds, partnerId],
    });
  };

  const handleRemovePartner = (partnerId: string) => {
    onUpdateEvent({
      ...event,
      partnerIds: assignedPartnerIds.filter((id) => id !== partnerId),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="size-5" />
          Partners
        </CardTitle>
        <CardDescription>
          {assignedPartners.length} assigned · {availablePartners.length} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignedPartners.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {assignedPartners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                {partner.logo && (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="size-8 rounded object-contain"
                  />
                )}
                <div>
                  <div className="text-sm font-medium">{partner.name}</div>
                  <div className="text-muted-foreground text-xs">{partner.contactPerson}</div>
                </div>
                <button
                  onClick={() => handleRemovePartner(partner.id)}
                  className="text-muted-foreground hover:text-destructive ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {availablePartners.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Add partner</Label>
            <Select onValueChange={handleAssignPartner}>
              <SelectTrigger className="w-[15rem]">
                <SelectValue placeholder="Select a partner..." />
              </SelectTrigger>
              <SelectContent>
                {availablePartners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name} — {partner.contactPerson}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {assignedPartners.length === 0 && availablePartners.length === 0 && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No partners available. Add partners in the Fundraising tab first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Contact Info Section ---

function EventContactSection({
  event,
  onUpdateEvent,
}: {
  event: FundraiserEvent;
  onUpdateEvent: (updatedEvent: FundraiserEvent) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-5" />
          Contact information
        </CardTitle>
        <CardDescription>Contact details shown to participants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Contact email</Label>
            <Input
              value={event.contactEmail ?? ""}
              onChange={(inputEvent) =>
                onUpdateEvent({ ...event, contactEmail: inputEvent.target.value })
              }
              placeholder="events@organisation.com"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Contact phone</Label>
            <Input
              value={event.contactPhone ?? ""}
              onChange={(inputEvent) =>
                onUpdateEvent({ ...event, contactPhone: inputEvent.target.value })
              }
              placeholder="+27 82 000 0000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main EventDetailPage ---

export function EventDetailPage({ event, config, onUpdate, onBack }: EventDetailPageProps) {
  const campaign = config.campaigns.find((campaign) => campaign.id === event.campaignId);

  const handleUpdateEvent = (updatedEvent: FundraiserEvent) => {
    const allEvents = config.events.map((existingEvent) =>
      existingEvent.id === updatedEvent.id ? updatedEvent : existingEvent
    );
    onUpdate({ events: allEvents });

    // Also update the event in the associated campaign
    if (campaign) {
      const updatedCampaigns = config.campaigns.map((existingCampaign) => {
        if (existingCampaign.id !== campaign.id) return existingCampaign;
        return {
          ...existingCampaign,
          events: existingCampaign.events.map((existingEvent) =>
            existingEvent.id === updatedEvent.id ? updatedEvent : existingEvent
          ),
        };
      });
      onUpdate({ campaigns: updatedCampaigns, events: allEvents });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="mt-0.5">
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2>{event.title}</h2>
              {event.status && (
                <Badge className={STATUS_COLOR_MAP[event.status] ?? ""}>
                  {event.status}
                </Badge>
              )}
              {event.category && (
                <Badge variant="outline">{event.category}</Badge>
              )}
            </div>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {formatDate(event.date)}
                {event.endDate && ` — ${formatDate(event.endDate)}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {formatTime(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {event.venue}
                {event.address && `, ${event.address}`}
              </span>
            </div>
            {campaign && (
              <div className="text-muted-foreground mt-1 text-xs">
                Campaign: <span className="font-medium">{campaign.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="team">Team & Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Event description */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code & Sharing */}
          <EventQrCodeSection event={event} config={config} />

          {/* Timetable */}
          <EventTimetableSection event={event} onUpdateEvent={handleUpdateEvent} />

          {/* Contact */}
          <EventContactSection event={event} onUpdateEvent={handleUpdateEvent} />
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <EventParticipantsSection event={event} onUpdateEvent={handleUpdateEvent} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <EventVolunteersSection
            event={event}
            volunteers={config.volunteers}
            onUpdateEvent={handleUpdateEvent}
          />
          <EventPartnersSection
            event={event}
            partners={config.partners}
            onUpdateEvent={handleUpdateEvent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
