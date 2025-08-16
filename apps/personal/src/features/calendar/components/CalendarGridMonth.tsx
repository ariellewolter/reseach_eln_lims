import React, { useMemo } from "react";
import { CalendarEvent } from "@research/types";

function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}

function getDaysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
}

export default function CalendarGridMonth({
  monthStart,
  events,
  onClickDay,
  onDropTask,
}: {
  monthStart: Date;
  events: CalendarEvent[];
  onClickDay: (date: Date) => void;
  onDropTask: (taskId: string, date: Date) => void;
}) {
  const daysInMonth = useMemo(() => getDaysInMonth(monthStart), [monthStart]);
  const firstDayOfMonth = useMemo(() => getFirstDayOfMonth(monthStart), [monthStart]);
  
  // Calculate calendar grid dates (including padding days)
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    
    // Add padding days from previous month
    const prevMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i));
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), i));
    }
    
    // Add padding days from next month to complete 6 weeks
    const remainingSlots = 42 - days.length; // 6 weeks * 7 days = 42
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, i));
    }
    
    return days;
  }, [monthStart, daysInMonth, firstDayOfMonth]);

  const monthEvents = useMemo(() => events.filter(ev => {
    const start = new Date(ev.start);
    return start.getMonth() === monthStart.getMonth() && 
           start.getFullYear() === monthStart.getFullYear();
  }), [events, monthStart]);

  const getEventsForDay = (date: Date) => {
    return monthEvents.filter(ev => {
      const evDate = new Date(ev.start);
      return evDate.getDate() === date.getDate() && 
             evDate.getMonth() === date.getMonth() && 
             evDate.getFullYear() === date.getFullYear();
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === monthStart.getMonth() && 
           date.getFullYear() === monthStart.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-neutral-200/40 dark:bg-neutral-800/50">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-background p-3 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((date, index) => (
          <div
            key={index}
            className={`min-h-[120px] bg-background p-2 relative ${
              !date || !isCurrentMonth(date) ? 'opacity-40' : ''
            } ${isToday(date!) ? 'ring-2 ring-blue-500/50' : ''}`}
            onClick={() => date && isCurrentMonth(date) && onClickDay(date)}
            onDragOver={(e) => {
              if (date && isCurrentMonth(date) && e.dataTransfer.types.includes("application/x-task-id")) {
                e.preventDefault();
              }
            }}
            onDrop={(e) => {
              if (!date || !isCurrentMonth(date)) return;
              const taskId = e.dataTransfer.getData("application/x-task-id");
              if (taskId) {
                e.preventDefault();
                onDropTask(taskId, date);
              }
            }}
          >
            {date && (
              <>
                <div className="text-sm font-medium mb-2">{date.getDate()}</div>
                
                {/* Events for this day */}
                <div className="space-y-1">
                  {getEventsForDay(date).slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      className="text-xs bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 dark:border-blue-400/25 rounded px-1 py-0.5 truncate"
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {getEventsForDay(date).length > 3 && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      +{getEventsForDay(date).length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
