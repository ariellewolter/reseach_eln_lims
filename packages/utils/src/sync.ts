import type { PublishFn, PullFn, SyncEnvelope } from '@types/shared/sync';

export const mockPublish = <T,>(): PublishFn<T> => async (e:SyncEnvelope<T>) => { 
  console.debug('publish', e); 
  return { ok:true }; 
};

export const mockPull = (): PullFn => async (_types) => { 
  return []; 
};
