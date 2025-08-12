export const PERSONAL_API = 'http://localhost:4001';

export async function listNotes() { 
  const r = await fetch(`${PERSONAL_API}/api/notes`); 
  return r.json(); 
}

export async function listTables() { 
  const r = await fetch(`${PERSONAL_API}/api/tables`); 
  return r.json(); 
}
