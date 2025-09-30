import { useEffect, useMemo, useState } from "react";
import type { EventItem } from "@/types/events";
import { parseDateLoose, pad2, formatDateTime } from "@/utils/date";
import "./Panel.css";

function formatEventDateTime(dateString: string, isAllDay?: boolean): string {
  if (!dateString?.trim()) return 'No date';
  
  if (isAllDay) {
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        const day = pad2(d.getDate());
        const month = pad2(d.getMonth() + 1);
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {}
    return dateString;
  }
  
  return formatDateTime(dateString);
}

function exportCsv(events: EventItem[]): void {
  const headers = ["title","start","end","location","allDay","sourceUrl"];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows = events.map(e => [
    e.title,
    e.start,
    e.end || "",
    e.location || "",
    e.allDay ? "true" : "false",
    e.sourceUrl
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(escape).join(";"))
    .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename: "events.csv",
    saveAs: false,
    conflictAction: "uniquify"
  });
}


function toICSDateTime(dateString: string): string {
  if (!dateString) return "";
  
  const date = parseDateLoose(dateString);
  if (!date) return "";
  
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeICS(text: string): string {
  return text.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

export default function Panel() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalizeSpaces(s = "") {
  return s.replace(/\s+/g, " ").trim();
}
function normalizeTitle(s = "") {
  return normalizeSpaces(s).toLowerCase();
}
function normalizeLocation(s = "") {
  return normalizeSpaces(s).toLowerCase();
}
function normalizeUrl(u = "") {
  try {
    const url = new URL(u);
    return (url.origin + url.pathname).toLowerCase();
  } catch {
    return normalizeSpaces(u).toLowerCase();
  }
}
function normDateKey(v?: string, allDay?: boolean) {
  if (!v) return "";
  const d = parseDateLoose(v);
  if (!d) return normalizeSpaces(v).toLowerCase();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  if (allDay) return `${y}-${m}-${day}`;
  return `${y}-${m}-${day}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function deduplicate(events: EventItem[]): EventItem[] {
  const map = new Map<string, EventItem>();

  for (const e of events) {
    const key = [
      normalizeTitle(e.title || ""),
      normDateKey(e.start, e.allDay),
      normDateKey(e.end, e.allDay),
      e.allDay ? "1" : "0",
      normalizeLocation(e.location || ""),
      normalizeUrl(e.sourceUrl || "")
    ].join("|");

    const existing = map.get(key);
    if (!existing) {
      const startKey = normDateKey(e.start, e.allDay);
      const endKey = normDateKey(e.end, e.allDay);
      map.set(key, {
        ...e,
        start: startKey || e.start,
        end: endKey || e.end
      });
    } else {
      map.set(key, {
        ...existing,
        end: existing.end || e.end,
        location: existing.location || e.location,
        description: existing.description || e.description
      });
    }
  }

  return Array.from(map.values());
}



const HISTORY_KEY = "extracted_events";

const clearAllEvents = async () => {
  try {
    await chrome.storage.sync.set({ [HISTORY_KEY]: [] });
    setEvents([]);
  } catch (error) {
  }
};

const deleteEvent = async (eventId: string) => {
  try {
    const updatedEvents = events.filter(event => event.id !== eventId);
    await chrome.storage.sync.set({ [HISTORY_KEY]: updatedEvents });
    setEvents(updatedEvents);
  } catch (error) {
  }
};

useEffect(() => {
  const load = async () => {
      const obj = await chrome.storage.sync.get([HISTORY_KEY]);
    const list: EventItem[] = Array.isArray(obj[HISTORY_KEY]) ? obj[HISTORY_KEY] : [];
    const cleaned = deduplicate(list);
    setEvents(cleaned);
    setLoading(false);
    if (cleaned.length !== list.length) {
      await chrome.storage.sync.set({ [HISTORY_KEY]: cleaned });
    }

    const localObj = await chrome.storage.local.get(['panelExtracting']);
    if (localObj.panelExtracting === true) {
      setExtracting(true);
    }
  };
  load();

  const onChanged = async (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === "sync" && changes[HISTORY_KEY]) {
      const n = changes[HISTORY_KEY].newValue;
      if (Array.isArray(n)) {
        const cleaned = deduplicate(n);
        setEvents(cleaned);
        setExtracting(false);
        if (cleaned.length !== n.length) {
          await chrome.storage.sync.set({ [HISTORY_KEY]: cleaned });
        }
      }
    }
    if (area === "local" && changes.panelExtracting) {
      const isExtracting = changes.panelExtracting.newValue;
      if (typeof isExtracting === 'boolean') {
        setExtracting(isExtracting);
        if (isExtracting) {
          setEvents([]);
        }
      }
    }
  };
  chrome.storage.onChanged.addListener(onChanged);

  const onMessage = (message: { type: string; events?: EventItem[] }) => {
    if (message.type === 'EXTRACTION_STARTED') {
      setExtracting(true);
      setEvents([]);
    } else if (message.type === 'EVENTS_EXTRACTED') {
      setExtracting(false);
      if (Array.isArray(message.events)) {
        const cleaned = deduplicate(message.events);
        setEvents(cleaned);
      }
    }
  };
  chrome.runtime.onMessage.addListener(onMessage);

  return () => {
    chrome.storage.onChanged.removeListener(onChanged);
    chrome.runtime.onMessage.removeListener(onMessage);
  };
}, []);



  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(
      (e) =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q) ||
        (e.start ?? "").toLowerCase().includes(q)
    );
  }, [events, query]);

  return (
    <div className="panel-root">
      <header className="panel-header">
        <h2 className="panel-title">
          📅 Extracted Events {events.length > 0 && <span className="event-count">({events.length})</span>}
        </h2>
        <div className="panel-controls">
          <input
            className="search-input"
            placeholder="Search events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            className="export-button"
            disabled={loading || filtered.length === 0}
            onClick={() => exportCsv(filtered)}
            title="Export filtered events as CSV"
          >
            CSV
          </button>
          <button
            className="export-button"
            disabled={loading || filtered.length === 0}
            onClick={() => exportIcs(filtered)}
            title="Export filtered events as ICS calendar"
          >
            ICS
          </button>
          <button
            className="clear-button"
            disabled={loading || events.length === 0}
            onClick={clearAllEvents}
            title="Clear all events"
          >
            Clear
          </button>
        </div>
      </header>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading events...</span>
        </div>
      )}

      {error && !loading && (
        <div className="error-state">
          <div className="error-content">
            <span>❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="events-container">
        {extracting && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <span>Extracting events...</span>
          </div>
        )}

        {!extracting && !loading && filtered.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No events found</div>
            <div className="empty-state-description">
              {events.length === 0
                ? "Click 'Extract Events' in the popup to scan web pages or emails"
                : "No events match your search query"}
            </div>
          </div>
        )}

        {!extracting && (
          <div className="events-list">
            {filtered.map((e) => (
              <div key={e.id} className="event-item">
                <div className="event-content">
                  <div className="event-title">{e.title}</div>
                  <div className="event-details">
                    {e.allDay ? (
                      <>
                        {formatEventDateTime(e.start, true)}
                        {e.end && e.end !== e.start && ` → ${formatEventDateTime(e.end, true)}`}
                        <span className="all-day-label"> • All day</span>
                      </>
                    ) : (
                      <>
                        {formatEventDateTime(e.start, false)}
                        {e.end && ` → ${formatEventDateTime(e.end, false)}`}
                      </>
                    )}
                    {e.location && ` • 📍 ${e.location}`}
                  </div>
                  {e.description && <div className="event-snippet">{e.description}</div>}
                  <div className="event-source">
                    🔗{" "}
                    <a
                      href={e.sourceUrl}
                      target="_blank"
                      rel="noopener"
                      className="event-source-link"
                    >
                      {safeHostname(e.sourceUrl)}
                    </a>
                  </div>
                </div>
                <button
                  className="event-delete-button"
                  onClick={() => deleteEvent(e.id)}
                  title="Delete this event"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}


function exportIcs(events: EventItem[]): void {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//EzCal//EN"];
  
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `SUMMARY:${escapeICS(event.title)}`,
      `DTSTART:${toICSDateTime(event.start)}`
    );
    
    if (event.end) {
      lines.push(`DTEND:${toICSDateTime(event.end)}`);
    }
    
    if (event.location) {
      lines.push(`LOCATION:${escapeICS(event.location)}`);
    }
    
    if (event.sourceUrl) {
      lines.push(`URL:${escapeICS(event.sourceUrl)}`);
    }
    
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }
    
    lines.push("END:VEVENT");
  }
  
  lines.push("END:VCALENDAR");
  
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: "events.ics" });
}
