import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ClipboardCheck,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/fanecto/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime, formatNaira, relativeTime } from "@/lib/fanecto/format";
import { canAccessRoommateChat } from "@/lib/fanecto/roommate-logic";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { cn } from "@/lib/utils";

function contextLabel(context: string) {
  switch (context) {
    case "rental":
      return "Property inquiry";
    case "inspection":
      return "Inspection chat";
    case "roommate":
      return "Roommate connection";
    case "agreement":
      return "Agreement";
    default:
      return "Conversation";
  }
}

function contextHint(context: string) {
  switch (context) {
    case "rental":
      return "Keep rent payments on Fanecto. Off-platform payment to avoid the 5% fee may trigger a warning.";
    case "inspection":
      return "Contact sharing is allowed after inspection payment succeeds.";
    case "roommate":
      return "Contact sharing unlocks after the ₦3,000 connection payment.";
    default:
      return "Messages stay inside Fanecto.";
  }
}

export function Inbox({ initialId }: { initialId?: string }) {
  const user = useCurrentFanectoUser();
  const navigate = useNavigate();
  const conversations = useFanecto((s) =>
    s.conversations.filter((c) => user && c.participantIds.includes(user.id)),
  );
  const messages = useFanecto((s) => s.messages);
  const users = useFanecto((s) => s.users);
  const properties = useFanecto((s) => s.properties);
  const inspections = useFanecto((s) => s.inspections);
  const sendMessage = useFanecto((s) => s.sendMessage);
  const roommateConnections = useFanecto((s) => s.roommateConnections);
  const [active, setActive] = useState<string | undefined>(initialId ?? conversations[0]?.id);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conv = conversations.find((c) => c.id === active);

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => {
      const other = users.find((u) => c.participantIds.includes(u.id) && u.id !== user?.id);
      return (
        c.title.toLowerCase().includes(q) ||
        other?.displayName.toLowerCase().includes(q) ||
        false
      );
    });
  }, [conversations, query, users, user?.id]);

  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === active)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, active],
  );

  const property = conv?.propertyId
    ? properties.find((p) => p.id === conv.propertyId)
    : undefined;
  const inspection = conv?.inspectionId
    ? inspections.find((i) => i.id === conv.inspectionId)
    : undefined;
  const roommateChatAvailable =
    !user || !conv || conv.context !== "roommate"
      ? true
      : canAccessRoommateChat(
          conv.roommateListingId
            ? roommateConnections.find(
                (c) =>
                  c.listingId === conv.roommateListingId &&
                  c.paid &&
                  (c.seekerId === user.id || c.creatorId === user.id),
              )
            : undefined,
        );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, active]);

  useEffect(() => {
    if (initialId) setActive(initialId);
  }, [initialId]);

  if (!user) return null;

  if (!conversations.length) {
    return (
      <EmptyState
        title="No conversations yet"
        body="Open a property and tap Message to start an inquiry. The home stays linked to the chat so you never lose context."
      />
    );
  }

  const other = conv ? users.find((u) => conv.participantIds.includes(u.id) && u.id !== user.id) : null;
  const showThread = Boolean(active);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !active || conv?.restricted || !roommateChatAvailable) return;
    setSending(true);
    sendMessage(active, draft.trim());
    setDraft("");
    setTimeout(() => setSending(false), 250);
  };

  return (
    <div className="grid h-[min(72vh,680px)] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-border)] lg:grid-cols-[18rem_1fr_16rem]">
      {/* Conversation list */}
      <div
        className={cn(
          "flex flex-col border-b border-border lg:border-b-0 lg:border-r",
          showThread && "hidden lg:flex",
        )}
      >
        <div className="border-b border-border px-3 py-3">
          <p className="text-sm font-semibold">Messages</p>
          <p className="text-xs text-muted-foreground">
            {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
          </p>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people or homes…"
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ul>
            {filteredConversations.map((c) => {
              const o = users.find((u) => c.participantIds.includes(u.id) && u.id !== user.id);
              const last = messages
                .filter((m) => m.conversationId === c.id)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
              const isActive = c.id === active;
              const prop = c.propertyId ? properties.find((p) => p.id === c.propertyId) : null;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActive(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-150",
                      isActive ? "bg-secondary" : "hover:bg-secondary/50",
                    )}
                  >
                    <img
                      src={o?.avatar}
                      alt=""
                      className="mt-0.5 size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">{o?.displayName ?? "User"}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {relativeTime(c.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-primary/90">
                        {contextLabel(c.context)}
                        {prop ? ` · ${prop.area}` : ""}
                      </p>
                      {last ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {last.senderId === user.id ? "You: " : ""}
                          {last.body}
                        </p>
                      ) : (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.title}</p>
                      )}
                      {c.restricted ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
                          <ShieldAlert className="size-3" /> Restricted
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>

      {/* Thread */}
      <div className={cn("flex min-h-0 flex-col", !showThread && "hidden lg:flex")}>
        {conv && other ? (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
                onClick={() => setActive(undefined)}
                aria-label="Back to conversations"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                onClick={() => {
                  /* profile entry point — route to role profile where available */
                }}
              >
                <img
                  src={other.avatar}
                  alt=""
                  className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{other.displayName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {contextLabel(conv.context)} · {other.role}
                  </p>
                </div>
              </button>
              <Button type="button" size="icon" variant="ghost" className="size-9 shrink-0" aria-label="More">
                <MoreVertical className="size-4" />
              </Button>
            </div>

            <div className="border-b border-border bg-secondary/40 px-4 py-2 text-[11px] leading-relaxed text-muted-foreground">
              {contextHint(conv.context)}
              {conv.restricted ? (
                <span className="mt-1 block font-medium text-destructive">
                  This thread is restricted after repeated off-platform payment warnings.
                </span>
              ) : null}
            </div>

            {/* Mobile property strip */}
            {property ? (
              <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2 lg:hidden">
                <img src={property.images[0]} alt="" className="size-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{property.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {property.area} · {formatNaira(property.annualRent)}/yr
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/properties/$id" params={{ id: property.id }}>
                    View
                  </Link>
                </Button>
              </div>
            ) : null}

            <ScrollArea className="flex-1">
              <div className="space-y-3 p-4">
                {thread.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No messages yet. Ask about availability, viewing times or what is included in the rent.
                  </p>
                ) : (
                  thread.map((m, idx) => {
                    const mine = m.senderId === user.id;
                    const prev = thread[idx - 1];
                    const showAvatar = !mine && (!prev || prev.senderId !== m.senderId);
                    const sender = users.find((u) => u.id === m.senderId);
                    return (
                      <div
                        key={m.id}
                        className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}
                      >
                        {!mine && (
                          <div className="size-7 shrink-0">
                            {showAvatar ? (
                              <img
                                src={sender?.avatar}
                                alt=""
                                className="size-7 rounded-full object-cover ring-1 ring-border"
                              />
                            ) : null}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                            mine
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md bg-secondary text-foreground",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p
                            className={cn(
                              "mt-1 text-[10px] tabular-nums",
                              mine ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {formatDateTime(m.createdAt)}
                          </p>
                          {m.warning ? (
                            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-warning/20 px-2 py-1.5 text-[11px] text-warning">
                              <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                              <span>
                                Warning: {m.warning}
                                {conv.circumventionWarnings
                                  ? ` (${conv.circumventionWarnings} so far)`
                                  : ""}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <form
              className="flex items-end gap-2 border-t border-border bg-card p-3"
              onSubmit={handleSend}
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-10 shrink-0 text-muted-foreground"
                disabled={conv.restricted}
                aria-label="Attach"
              >
                <Paperclip className="size-4" />
              </Button>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={conv.restricted || !roommateChatAvailable ? "This thread is inactive" : "Write a message…"}
                disabled={conv.restricted || !roommateChatAvailable || sending}
                className="min-h-10 flex-1 rounded-full border-border bg-secondary/50 px-4"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={conv.restricted || !roommateChatAvailable || !draft.trim() || sending}
                className="size-10 shrink-0 rounded-full"
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-2 p-8 text-center lg:flex">
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Choose a thread. Property inquiries keep the home attached so you can book an inspection or open the
              listing without searching again.
            </p>
          </div>
        )}
      </div>

      {/* Desktop context panel */}
      <aside className="hidden border-l border-border lg:flex lg:flex-col">
        {conv && other ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {property ? "Property" : "Details"}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                {property ? (
                  <div className="space-y-3">
                    <img
                      src={property.images[0]}
                      alt=""
                      className="aspect-[4/3] w-full rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-medium leading-snug">{property.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {property.area}, {property.city}
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums">
                        {formatNaira(property.annualRent)}
                        <span className="font-normal text-muted-foreground"> / year</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button asChild size="sm">
                        <Link to="/properties/$id" params={{ id: property.id }}>
                          View property
                        </Link>
                      </Button>
                      {conv.context === "rental" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            void navigate({ to: "/properties/$id", params: { id: property.id } });
                          }}
                        >
                          <ClipboardCheck className="mr-1.5 size-3.5" />
                          Book inspection
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No property linked to this conversation.</p>
                )}

                {inspection ? (
                  <div className="rounded-xl bg-secondary/60 p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Inspection
                    </p>
                    <p className="mt-1 font-medium capitalize">{inspection.status.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fee {formatNaira(inspection.fee)} · chat{" "}
                      {inspection.chatUnlocked ? "unlocked" : "locked until payment"}
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-2 w-full">
                      <Link to="/inspections">Open inspections</Link>
                    </Button>
                  </div>
                ) : null}

                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Person
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <img src={other.avatar} alt="" className="size-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium">{other.displayName}</p>
                      <p className="text-xs capitalize text-muted-foreground">{other.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-muted-foreground">
            Select a conversation to see the linked property and next actions.
          </div>
        )}
      </aside>
    </div>
  );
}
