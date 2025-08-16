export const PERSONAL_API = 'http://localhost:4001';

export async function listNotes() { 
  const r = await fetch(`${PERSONAL_API}/api/notes`); 
  return r.json(); 
}

export async function listTables() { 
  const r = await fetch(`${PERSONAL_API}/api/tables`); 
  return r.json(); 
}

export async function updateNote(id: string, note: any) {
  const r = await fetch(`${PERSONAL_API}/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  return r.json();
}

export async function createNote(note: any) {
  const r = await fetch(`${PERSONAL_API}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  return r.json();
}

export async function updateProperties(documentId: string, properties: any) {
  const r = await fetch(`${PERSONAL_API}/api/properties/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(properties)
  });
  return r.json();
}
