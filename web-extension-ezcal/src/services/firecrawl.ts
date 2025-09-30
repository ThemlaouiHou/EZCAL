const BASE = "https://api.firecrawl.dev";

export interface FirecrawlMetadata {
  title?: string;
  description?: string;
  sourceURL?: string;
  statusCode?: number;
}


export async function firecrawlScrapeHTML(
  apiKey: string, 
  url: string, 
  timeoutMs = 20000, 
  externalSignal?: AbortSignal
): Promise<{ html?: string; metadata?: FirecrawlMetadata }> {
  
  const body = { 
    url, 
    formats: ["html"], 
    onlyMainContent: true 
  };
  
  const result = await executeFirecrawlRequest(body, apiKey, timeoutMs, externalSignal);
  return {
    html: result.data?.html,
    metadata: result.data?.metadata
  };
}

export async function firecrawlScrapeMarkdown(
  apiKey: string, 
  url: string, 
  timeoutMs = 20000, 
  externalSignal?: AbortSignal
): Promise<{ markdown?: string; metadata?: FirecrawlMetadata }> {
  
  const body = { 
    url, 
    formats: ["markdown"], 
    onlyMainContent: true 
  };
  
  const result = await executeFirecrawlRequest(body, apiKey, timeoutMs, externalSignal);
  return {
    markdown: result.data?.markdown,
    metadata: result.data?.metadata
  };
}


async function executeFirecrawlRequest(
  body: Record<string, unknown>,
  apiKey: string,
  timeoutMs: number,
  externalSignal?: AbortSignal
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }
  
  try {
    const response = await fetch(`${BASE}/v2/scrape`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}


