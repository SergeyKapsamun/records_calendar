export interface InfoCalendar {
  period?: number
  entities: Record<number, Entity>
  changeVisitStatus: (entityId: number, id: number, visitStatus: number) => Promise<void>
}
export interface Entity {
  id: number
  caption: string
  description: string
  avatar: string | null
  workSlots: Slot[]
  breakSlots?: Slot[]
  records?: Array<IRecord> | []
  activity?: Array<IActivity> | []
}
export interface Slot {
  from: string
  to: string
}

export interface Session {
  id: number
  from: string
  to: string
  caption?: string
  description?: string
  backColor?: string | null
  sessionArray?: Array<IRecord> | Array<IActivity> | []
}

export interface IRecord extends Session {
  services: string[]
  visitStatus: number
  cost: string
  details: string[]
  sessionArray?: Array<IRecord> | []
}
export interface IActivity extends Session {
  capacity: number
  recordsCount: number
  serviceName: string
  sessionArray?: Array<IActivity> | []
}

export enum VisitStatus {
  WAIT = 0,
  CLIENT_COME = 1,
  CONFIRMED = 2,
  CLIENT_NO_COME = -1,
}
