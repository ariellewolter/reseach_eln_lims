import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarEvent, CalendarViewType, TimeBlock } from '@research/types';
import { idbJSON } from '../../../state/persist.js';

interface CalendarState {
  events: CalendarEvent[];
  activeView: CalendarViewType;
  currentDate: string; // ISO string
  selectedEventId: string | null;
  selectedTimeSlot: TimeBlock | null;
  
  // Actions
  addEvent: (input: Partial<CalendarEvent>) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  linkTaskToEvent: (taskId: string, eventId: string) => void;
  
  // View management
  setActiveView: (view: CalendarViewType) => void;
  setCurrentDate: (date: string) => void;
  navigateDate: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  
  // Selection
  selectEvent: (id: string | null) => void;
  selectTimeSlot: (slot: TimeBlock | null) => void;
  
  // Time blocking
  createTimeBlock: (taskId: string, start: string, end: string) => CalendarEvent;
  updateTimeBlock: (eventId: string, start: string, end: string) => void;
  
  // Computed getters
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForRange: (start: string, end: string) => CalendarEvent[];
  getEventById: (id: string) => CalendarEvent | undefined;
  getLinkedTaskEvents: (taskId: string) => CalendarEvent[];
  
  // ICS import/export
  importICS: (file: File) => Promise<CalendarEvent[]>;
  exportICS: (range: { start: string; end: string }) => string;
}

const today = new Date().toISOString().split('T')[0];

// Initialize with empty events array - data will be loaded from storage or API
const sampleEvents: CalendarEvent[] = [];

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: sampleEvents,
      activeView: 'week',
      currentDate: today,
      selectedEventId: null,
      selectedTimeSlot: null,

      addEvent: (input) => {
        const now = new Date().toISOString();
        
        // Validate start and end times
        let startTime = input.start || now;
        let endTime = input.end || new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        // Ensure start is before end
        if (new Date(startTime) >= new Date(endTime)) {
          console.error('Invalid event time range: start must be before end');
          endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
        }
        
        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          title: input.title || 'Untitled Event',
          description: input.description || '',
          start: startTime,
          end: endTime,
          allDay: input.allDay || false,
          source: input.source || 'manual',
          tags: input.tags || [],
          createdAt: now,
          updatedAt: now,
          ...input,
        };
        
        console.log('Adding new event:', newEvent);
        set((state) => ({
          events: [...state.events, newEvent],
        }));
        
        return newEvent;
      },

      updateEvent: (id, patch) => {
        console.log('Updating event:', id, 'with patch:', patch);
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? { ...event, ...patch, updatedAt: new Date().toISOString() }
              : event
          ),
        }));
      },

      deleteEvent: (id) => {
        console.log('Deleting event:', id);
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
        }));
      },

      linkTaskToEvent: (taskId, eventId) => {
        console.log('Linking task:', taskId, 'to event:', eventId);
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? { ...event, linkedTaskId: taskId, updatedAt: new Date().toISOString() }
              : event
          ),
        }));
      },

      setActiveView: (view) => {
        console.log('Setting active view:', view);
        set({ activeView: view });
      },

      setCurrentDate: (date) => {
        console.log('Setting current date:', date);
        set({ currentDate: date });
      },

      navigateDate: (direction) => {
        const state = get();
        const currentDate = new Date(state.currentDate);
        
        if (direction === 'prev') {
          if (state.activeView === 'day') {
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (state.activeView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
          } else if (state.activeView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
          }
        } else {
          if (state.activeView === 'day') {
            currentDate.setDate(currentDate.getDate() + 1);
          } else if (state.activeView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
          } else if (state.activeView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }
        
        set({ currentDate: currentDate.toISOString().split('T')[0] });
      },

      goToToday: () => {
        console.log('Going to today');
        set({ currentDate: today });
      },

      selectEvent: (id) => {
        console.log('Selecting event:', id);
        set({ selectedEventId: id });
      },

      selectTimeSlot: (slot) => {
        console.log('Selecting time slot:', slot);
        set({ selectedTimeSlot: slot });
      },

      createTimeBlock: (taskId, start, end) => {
        const now = new Date().toISOString();
        
        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          title: `Time Block for Task ${taskId}`,
          description: 'Time block created from task',
          start,
          end,
          allDay: false,
          source: 'task_block',
          linkedTaskId: taskId,
          tags: [],
          createdAt: now,
          updatedAt: now,
        };
        
        console.log('Creating time block:', newEvent);
        set((state) => ({
          events: [...state.events, newEvent],
        }));
        
        return newEvent;
      },

      updateTimeBlock: (eventId, start, end) => {
        console.log('Updating time block:', eventId, 'with start:', start, 'end:', end);
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? { ...event, start, end, updatedAt: new Date().toISOString() }
              : event
          ),
        }));
      },

      getEventsForDate: (date) => {
        const state = get();
        const targetDate = new Date(date);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        console.log('Getting events for date:', date, 'target:', targetDateStr);
        const filteredEvents = state.events.filter((event) => {
          const eventStart = new Date(event.start);
          const eventStartStr = eventStart.toISOString().split('T')[0];
          return eventStartStr === targetDateStr;
        });
        console.log('Found events:', filteredEvents);
        return filteredEvents;
      },

      getEventsForRange: (start, end) => {
        const state = get();
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        console.log('Getting events for range:', start, 'to', end);
        const filteredEvents = state.events.filter((event) => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          
          // Check if event overlaps with range
          return eventStart < endDate && eventEnd > startDate;
        });
        console.log('Found events in range:', filteredEvents);
        return filteredEvents;
      },

      getEventById: (id) => {
        const event = get().events.find((event) => event.id === id);
        console.log('Getting event by ID:', id, 'found:', event);
        return event;
      },

      getLinkedTaskEvents: (taskId) => {
        const events = get().events.filter((event) => event.linkedTaskId === taskId);
        console.log('Getting linked task events for task:', taskId, 'found:', events);
        return events;
      },

      importICS: async (file) => {
        console.log('Importing ICS file:', file.name);
        try {
          const text = await file.text();
          const lines = text.split('\n');
          const events: CalendarEvent[] = [];
          let currentEvent: Partial<CalendarEvent> = {};
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('BEGIN:VEVENT')) {
              currentEvent = {};
            } else if (trimmedLine.startsWith('END:VEVENT')) {
              if (currentEvent.title && currentEvent.start && currentEvent.end) {
                const now = new Date().toISOString();
                const newEvent: CalendarEvent = {
                  id: crypto.randomUUID(),
                  title: currentEvent.title,
                  description: currentEvent.description || '',
                  start: currentEvent.start,
                  end: currentEvent.end,
                  allDay: currentEvent.allDay || false,
                  source: 'imported_ics',
                  tags: currentEvent.tags || [],
                  createdAt: now,
                  updatedAt: now,
                };
                events.push(newEvent);
              }
              currentEvent = {};
            } else if (trimmedLine.startsWith('SUMMARY:')) {
              currentEvent.title = trimmedLine.substring(8);
            } else if (trimmedLine.startsWith('DESCRIPTION:')) {
              currentEvent.description = trimmedLine.substring(12);
            } else if (trimmedLine.startsWith('DTSTART')) {
              const dateStr = trimmedLine.includes(':') ? trimmedLine.split(':')[1] : '';
              if (dateStr) {
                currentEvent.start = parseICSDate(dateStr);
                // Check if it's an all-day event
                if (dateStr.length === 8) { // YYYYMMDD format
                  currentEvent.allDay = true;
                }
              }
            } else if (trimmedLine.startsWith('DTEND')) {
              const dateStr = trimmedLine.includes(':') ? trimmedLine.split(':')[1] : '';
              if (dateStr) {
                currentEvent.end = parseICSDate(dateStr);
              }
            } else if (trimmedLine.startsWith('UID:')) {
              currentEvent.id = trimmedLine.substring(4);
            }
          }
          
          console.log('Imported events:', events);
          // Add imported events to store
          set((state) => ({
            events: [...state.events, ...events],
          }));
          
          return events;
        } catch (error) {
          console.error('Error importing ICS file:', error);
          throw new Error('Failed to import ICS file');
        }
      },

             exportICS: (range) => {
         const state = get();
         const events = state.getEventsForRange(range.start, range.end);
         
         console.log('Exporting ICS for range:', range, 'events:', events);
        
        let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Research Notebook//Tasks Calendar//EN\r\n';
        
        for (const event of events) {
          ics += 'BEGIN:VEVENT\r\n';
          ics += `UID:${event.id}\r\n`;
          ics += `SUMMARY:${event.title}\r\n`;
          if (event.description) {
            ics += `DESCRIPTION:${event.description}\r\n`;
          }
          ics += `DTSTART:${formatICSDate(event.start)}\r\n`;
          ics += `DTEND:${formatICSDate(event.end)}\r\n`;
          ics += `DTSTAMP:${formatICSDate(new Date().toISOString())}\r\n`;
          ics += 'END:VEVENT\r\n';
        }
        
        ics += 'END:VCALENDAR\r\n';
        return ics;
      },
    }),
    {
      name: 'calendar-v1',
      storage: idbJSON(),
      partialize: (state) => {
        console.log('Persisting calendar store state:', state);
        return {
          events: state.events,
          activeView: state.activeView,
        };
      },
    }
  )
);

// Helper functions for ICS parsing
function parseICSDate(dateStr: string): string {
  try {
    // Handle ICS date formats: YYYYMMDD or YYYYMMDDTHHMMSSZ
    if (dateStr.length === 8) {
      // Date only: YYYYMMDD
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
    } else if (dateStr.includes('T')) {
      // Date with time: YYYYMMDDTHHMMSSZ
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const time = dateStr.substring(9);
      return new Date(`${year}-${month}-${day}T${time}`).toISOString();
    } else {
      // Fallback to standard parsing
      return new Date(dateStr).toISOString();
    }
  } catch (error) {
    console.error('Error parsing ICS date:', dateStr, error);
    return new Date().toISOString(); // Fallback to current time
  }
}

function formatICSDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  } catch (error) {
    console.error('Error formatting ICS date:', dateStr, error);
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
}

// Debug logging for store initialization
console.log('Calendar store module loaded');
