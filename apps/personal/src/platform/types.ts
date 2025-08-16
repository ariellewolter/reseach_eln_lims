export type PlatformAPI = {
  openExternal(url: string): void;
  notify(opts: { title: string; body?: string }): Promise<void>;
  getVersion(): string;
  isTauri: boolean;
};
