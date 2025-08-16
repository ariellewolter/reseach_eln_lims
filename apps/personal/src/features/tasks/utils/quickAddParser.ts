import { QuickAddParseResult, TaskPriority, TaskRecurrence, TaskContext } from '@research/types';

export class QuickAddParser {
  private static readonly PRIORITY_PATTERNS = {
    urgent: /!urgent|!critical|!asap/gi,
    high: /!high|!important|!priority/gi,
    med: /!medium|!med/gi,
    low: /!low|!minor/gi,
  };

  private static readonly TIME_PATTERNS = {
    // Relative dates
    today: /today|tonight/gi,
    tomorrow: /tomorrow|tmr/gi,
    nextWeek: /next week/gi,
    nextMonth: /next month/gi,
    
    // Days of week
    monday: /monday|mon/gi,
    tuesday: /tuesday|tue|tues/gi,
    wednesday: /wednesday|wed/gi,
    thursday: /thursday|thu|thurs/gi,
    friday: /friday|fri/gi,
    saturday: /saturday|sat/gi,
    sunday: /sunday|sun/gi,
    
    // Time patterns
    time: /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/gi,
    timeRange: /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/gi,
    hourMinute: /(\d{1,2}):(\d{2})/gi,
  };

  private static readonly RECURRENCE_PATTERNS = {
    daily: /every day|daily|each day/gi,
    weekly: /every week|weekly|each week/gi,
    monthly: /every month|monthly|each month/gi,
    custom: /every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/gi,
  };

  private static readonly REMINDER_PATTERNS = {
    remind: /remind\s+(\d+)\s*(min|minutes?|hour|hours?|day|days?)/gi,
  };

  private static readonly ESTIMATE_PATTERNS = {
    estimate: /(\d+)\s*(min|minutes?|hour|hours?)/gi,
  };

  private static readonly CONTEXT_PATTERNS = {
    lab: /#lab|lab work/gi,
    writing: /#writing|writing/gi,
    reading: /#reading|reading/gi,
    analysis: /#analysis|analysis/gi,
    admin: /#admin|admin/gi,
  };

  static parse(input: string): QuickAddParseResult {
    const result: QuickAddParseResult = {
      title: '',
      tags: [],
      links: [],
    };

    // Extract tags (#tag)
    const tagMatches = input.match(/#[\w-]+/g) || [];
    result.tags = tagMatches.map(tag => tag.substring(1));
    
    // Extract links [[link]]
    const linkMatches = input.match(/\[\[([^\]]+)\]\]/g) || [];
    result.links = linkMatches.map(link => link.substring(2, link.length - 2));
    
    // Extract priority
    result.priority = this.extractPriority(input);
    
    // Extract dates and times
    const dateTimeResult = this.extractDateTime(input);
    Object.assign(result, dateTimeResult);
    
    // Extract recurrence
    result.recurrence = this.extractRecurrence(input);
    
    // Extract reminder
    const reminderResult = this.extractReminder(input);
    if (reminderResult.reminderLeadTime) {
      result.reminderLeadTime = reminderResult.reminderLeadTime;
    }
    
    // Extract estimate
    const estimateResult = this.extractEstimate(input);
    if (estimateResult.estimateMin) {
      result.estimateMin = estimateResult.estimateMin;
    }
    
    // Extract context
    result.context = this.extractContext(input);
    
    // Clean up input and extract title
    result.title = this.extractTitle(input, result);
    
    return result;
  }

  private static extractPriority(input: string): TaskPriority | undefined {
    for (const [priority, pattern] of Object.entries(this.PRIORITY_PATTERNS)) {
      if (pattern.test(input)) {
        return priority as TaskPriority;
      }
    }
    return undefined;
  }

  private static extractDateTime(input: string): Partial<QuickAddParseResult> {
    const result: Partial<QuickAddParseResult> = {};
    
    // Check for relative dates
    if (this.TIME_PATTERNS.today.test(input)) {
      result.dueDate = new Date().toISOString().split('T')[0];
    } else if (this.TIME_PATTERNS.tomorrow.test(input)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      result.dueDate = tomorrow.toISOString().split('T')[0];
    } else if (this.TIME_PATTERNS.nextWeek.test(input)) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      result.dueDate = nextWeek.toISOString().split('T')[0];
    } else if (this.TIME_PATTERNS.nextMonth.test(input)) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      result.dueDate = nextMonth.toISOString().split('T')[0];
    }
    
    // Check for specific days of week
    const dayPatterns = [
      { pattern: this.TIME_PATTERNS.monday, days: 1 },
      { pattern: this.TIME_PATTERNS.tuesday, days: 2 },
      { pattern: this.TIME_PATTERNS.wednesday, days: 3 },
      { pattern: this.TIME_PATTERNS.thursday, days: 4 },
      { pattern: this.TIME_PATTERNS.friday, days: 5 },
      { pattern: this.TIME_PATTERNS.saturday, days: 6 },
      { pattern: this.TIME_PATTERNS.sunday, days: 0 },
    ];
    
    for (const { pattern, days } of dayPatterns) {
      if (pattern.test(input)) {
        const targetDate = new Date();
        const currentDay = targetDate.getDay();
        let daysToAdd = (days - currentDay + 7) % 7;
        if (daysToAdd === 0) {
          daysToAdd = 7; // Next occurrence
        }
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        result.dueDate = targetDate.toISOString().split('T')[0];
        break;
      }
    }
    
    // Check for time ranges
    const timeRangeMatch = input.match(this.TIME_PATTERNS.timeRange);
    if (timeRangeMatch) {
      const [_, startHour, startMin, startAmPm, endHour, endMin, endAmPm] = timeRangeMatch;
      result.startTime = this.parseTime(startHour, startMin, startAmPm);
      result.endTime = this.parseTime(endHour, endMin, endAmPm);
    } else {
      // Check for single time
      const timeMatch = input.match(this.TIME_PATTERNS.time);
      if (timeMatch) {
        const [_, hour, min, amPm] = timeMatch;
        result.startTime = this.parseTime(hour, min, amPm);
      }
    }
    
    return result;
  }

  private static parseTime(hour: string, min: string | undefined, amPm: string): string {
    let h = parseInt(hour);
    const m = min ? parseInt(min) : 0;
    
    if (amPm.toLowerCase().startsWith('p') && h !== 12) {
      h += 12;
    } else if (amPm.toLowerCase().startsWith('a') && h === 12) {
      h = 0;
    }
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private static extractRecurrence(input: string): TaskRecurrence | undefined {
    if (this.RECURRENCE_PATTERNS.daily.test(input)) {
      return { rule: 'DAILY' };
    } else if (this.RECURRENCE_PATTERNS.weekly.test(input)) {
      return { rule: 'WEEKLY' };
    } else if (this.RECURRENCE_PATTERNS.monthly.test(input)) {
      return { rule: 'MONTHLY' };
    } else if (this.RECURRENCE_PATTERNS.custom.test(input)) {
      return { rule: 'CUSTOM' };
    }
    return undefined;
  }

  private static extractReminder(input: string): { reminderLeadTime?: number } {
    const match = input.match(this.REMINDER_PATTERNS.remind);
    if (match) {
      const [fullMatch, amount, unit] = match;
      let minutes = parseInt(amount);
      
      if (unit.toLowerCase().startsWith('hour')) {
        minutes *= 60;
      } else if (unit.toLowerCase().startsWith('day')) {
        minutes *= 24 * 60;
      }
      
      return { reminderLeadTime: minutes };
    }
    return {};
  }

  private static extractEstimate(input: string): { estimateMin?: number } {
    const match = input.match(this.ESTIMATE_PATTERNS.estimate);
    if (match) {
      const [_, amount, unit] = match;
      let minutes = parseInt(amount);
      
      if (unit.toLowerCase().startsWith('hour')) {
        minutes *= 60;
      }
      
      return { estimateMin: minutes };
    }
    return {};
  }

  private static extractContext(input: string): TaskContext | undefined {
    for (const [context, pattern] of Object.entries(this.CONTEXT_PATTERNS)) {
      if (pattern.test(input)) {
        return context as TaskContext;
      }
    }
    return undefined;
  }

  private static extractTitle(input: string, result: QuickAddParseResult): string {
    let title = input;
    
    // Remove all extracted patterns to get clean title
    title = title.replace(/#[\w-]+/g, ''); // Remove tags
    title = title.replace(/\[\[([^\]]+)\]\]/g, ''); // Remove links
    title = title.replace(/![\w]+/g, ''); // Remove priority markers
    title = title.replace(/remind\s+\d+\s*(min|minutes?|hour|hours?|day|days?)/gi, ''); // Remove reminder
    title = title.replace(/(\d+)\s*(min|minutes?|hour|hours?)/gi, ''); // Remove estimate
    
    // Remove date/time patterns
    title = title.replace(/today|tonight|tomorrow|tmr|next week|next month/gi, '');
    title = title.replace(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/gi, '');
    title = title.replace(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/gi, '');
    title = title.replace(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/gi, '');
    title = title.replace(/(\d{1,2}):(\d{2})/gi, '');
    
    // Remove recurrence patterns
    title = title.replace(/every day|daily|each day|every week|weekly|each week|every month|monthly|each month/gi, '');
    title = title.replace(/every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/gi, '');
    
    // Clean up extra whitespace and punctuation
    title = title.replace(/\s+/g, ' ').trim();
    title = title.replace(/^[,.\s]+|[,.\s]+$/g, '');
    
    return title || 'Untitled Task';
  }
}

export const useQuickAddParser = () => {
  return {
    parse: QuickAddParser.parse,
  };
};
