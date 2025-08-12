// Local type definitions to avoid circular dependencies
export type SyncEntityType = 'project'|'note'|'table'|'inventory'|'task';
export type SyncEnvelope<T> = { type: SyncEntityType; version: string; payload: T; source: 'personal'|'lims'; at: string; };

export type PublishFn<T> = (e: SyncEnvelope<T>) => Promise<{ ok: true }>;
export type PullFn = (types: SyncEntityType[]) => Promise<SyncEnvelope<any>[]>;

export const mockPublish = <T,>(): PublishFn<T> => async (e:SyncEnvelope<T>) => { 
  console.debug('publish', e); 
  return { ok:true }; 
};

export const mockPull = (): PullFn => async (_types: SyncEntityType[]) => { 
  return []; 
};
