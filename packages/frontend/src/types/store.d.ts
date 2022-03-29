declare interface ServerStatus {
  online: boolean;
  offlineTimer: NodeJS.Timeout | undefined;
  offlineTime: number;
}
