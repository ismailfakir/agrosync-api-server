// types.ts
export interface ServerToClientEvents {
  notification: (data: { message: string; timestamp: Date }) => void;
}

export interface ClientToServerEvents {
  join_room: (userId: string) => void;
}