import type { EventItem } from "@/types/events";
import { HTML_PROMPT, MARKDOWN_PROMPT, HTML_SYSTEM_PROMPT, MARKDOWN_SYSTEM_PROMPT } from "./mistral-prompts";
import { normalizeDateTime } from "@/utils/date";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
export const MISTRAL_MODEL = "mistral-small-2503";

function limitContent(content: string): string {
  if (content.length <= 100000) return content;
  
  const sections = [
    ...content.matchAll(/<main[^>]*>([\s\S]*?)<\/main>/gi),
    ...content.matchAll(/role="main"[^>]*>([\s\S]*?)(?=<[^>]*role=|$)/gi),
    ...content.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/gi)
  ].map(m => m[1]).filter(s => s?.length > 500);
  
  return sections.length > 0 ? sections.join('\n\n') : content.substring(0, 80000);
}

async function extractEvents(
  apiKey: string,
  content: string,
  sourceUrl: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 35000
): Promise<EventItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(MISTRAL_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\n# SOURCE URL\n${sourceUrl}\n\n# CONTENT\n${content}` }
        ],
        temperature: 0,
        max_tokens: 1000
      }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "";
    const tsv = rawContent.match(/```(?:text|tsv|csv|markdown)?\s*([\s\S]*?)```/i)?.[1]?.trim() ?? rawContent;
    
    return tsv
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter(Boolean)
      .map((line: string, index: number): EventItem | null => {
        const [title, startRaw, endRaw, location, allDayRaw] = line.split("|").map((p: string) => p.trim());
        if (!title || !startRaw) return null;

        return {
          id: `event_${index}`,
          title,
          start: normalizeDateTime(startRaw),
          end: endRaw ? normalizeDateTime(endRaw) : undefined,
          location: location || undefined,
          allDay: /^true$/i.test(allDayRaw || ""),
          sourceUrl
        };
      })
      .filter((event: EventItem | null): event is EventItem => event !== null);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Mistral API request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function mistralExtractFromHTML(
  apiKey: string,
  htmlContent: string,
  sourceUrl: string,
  timeoutMs = 35000
): Promise<EventItem[]> {
  return extractEvents(apiKey, limitContent(htmlContent), sourceUrl, HTML_SYSTEM_PROMPT, HTML_PROMPT, timeoutMs);
}

export async function mistralExtractFromMarkdown(
  apiKey: string,
  markdownContent: string,
  sourceUrl: string,
  timeoutMs = 35000
): Promise<EventItem[]> {
  return extractEvents(apiKey, markdownContent, sourceUrl, MARKDOWN_SYSTEM_PROMPT, MARKDOWN_PROMPT, timeoutMs);
}