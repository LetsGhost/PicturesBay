export interface Room{
  name: string;
  timer: NodeJS.Timeout;
  interval: NodeJS.Timeout;
  users: Set<string>;
  oneMinuteInterval: NodeJS.Timeout;
  creationTime: number;
}