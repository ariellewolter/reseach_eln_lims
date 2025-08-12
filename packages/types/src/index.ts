export type ID = string;

export type DocType = 'note' | 'table' | 'pdf' | 'text';

export type Note = { id: ID; title: string; markdown: string; userId?: ID; projectId?: ID; updatedAt?: string; createdAt?: string; };
export type TableDoc = { id: ID; title: string; data: string[][]; userId?: ID; projectId?: ID; updatedAt?: string; createdAt?: string; };

export type Project = { id: ID; title: string; description?: string; ownerId: ID; };
export type Chemical = { id: ID; name: string; cas?: string; vendor?: string; catalog?: string; units?: string; };

export type Task = { id: ID; title: string; status: 'todo'|'doing'|'done'; assigneeId?: ID; due?: string; };

export type Lab = { id: ID; name: string; };
export type User = { id: ID; name: string; email: string; role: 'student'|'pi'|'tech'|'admin'; labId?: ID; };
