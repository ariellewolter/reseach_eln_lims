export const LIMS_API = 'http://localhost:4002';

export async function listInventory() { 
  const r = await fetch(`${LIMS_API}/api/inventory`); 
  return r.json(); 
}

export async function listTasks() { 
  const r = await fetch(`${LIMS_API}/api/tasks`); 
  return r.json(); 
}
