export type ID = string;

export type DocType = 'note' | 'table' | 'pdf' | 'text';

export type Note = { id: ID; title: string; markdown: string; userId?: ID; projectId?: ID; updatedAt?: string; createdAt?: string; };
export type TableDoc = { id: ID; title: string; data: string[][]; columns?: Array<{ id: string; type: string; width?: number; align?: string; format?: string; options?: string[] }>; userId?: ID; projectId?: ID; updatedAt?: string; createdAt?: string; };

export type Project = { id: ID; title: string; description?: string; ownerId: ID; };
export type Chemical = { id: ID; name: string; cas?: string; vendor?: string; catalog?: string; units?: string; };

// Note: Task type is now exported from './tasks' with comprehensive functionality

export type Lab = { id: ID; name: string; };
export type User = { id: ID; name: string; email: string; role: 'student'|'pi'|'tech'|'admin'; labId?: ID; };

// Properties system exports
export * from './properties';
export * from './sync';
export * from './tasks';
