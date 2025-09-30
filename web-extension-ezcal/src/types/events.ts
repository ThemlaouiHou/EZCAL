export type EventItem = {
  id: string;
  title: string;
  start: string;        
  end?: string;
  location?: string;
  allDay?: boolean;
  sourceUrl: string;
  description?: string;
};
