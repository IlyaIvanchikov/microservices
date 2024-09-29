export interface IDomainEvent {
  topic: string;
  payload: unknown;
}
