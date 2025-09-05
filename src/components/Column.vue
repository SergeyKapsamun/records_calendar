<template>
  <div class="column">
    <!-- 1) Сетка: перерывы, свободные, занятые и нерабочие ячейки -->
    <div class="hour" v-for="hour in timeStartEndArray.slice(0, -1)" :key="hour">
      <div
        class="row"
        v-for="slotIdx in Math.ceil(60 / period)"
        :key="slotIdx"
        :style="{ height: period + 'px' }"
      >
        <!-- Перерыв -->
        <template v-if="isInBreak(hour, slotIdx - 1)">
          <div class="disabled">
            <template v-if="isBreakStartCell(hour, slotIdx - 1)">
              <span class="inactive-label">
                {{ getBreakLabel(hour, slotIdx - 1) }}
              </span>
            </template>
          </div>

          <!-- Доступно для нового сеанса -->
        </template>

        <template v-else-if="isAvailable(hour, slotIdx - 1)">
          <div
            class="new-session"
            @click="emit('clickDate', $event, +props.entityId, hour, (slotIdx - 1) * period)"
          >
            <span class="time">{{ paddedTime(hour, slotIdx - 1) }}</span>
            <span>Новый сеанс</span>
          </div>
        </template>
        <!-- Занято (рабочий, но уже под сеансом) -->
        <template v-else-if="isInWork(hour, slotIdx - 1)">
          <div class="disabled"></div>
        </template>
        <!-- Нерабочее время -->
        <template v-else>
          <div class="disabled">
            <template v-if="isInactiveStartCell(hour, slotIdx - 1)">
              <span class="inactive-label">
                {{ getInactiveLabel(hour, slotIdx - 1) }}
              </span>
            </template>
          </div>
        </template>
      </div>
    </div>

    <!-- 2) Абсолютно позиционированные реальные сеансы (Записи и групповые записи) -->
    <RecordsOut
      :records="records"
      :changeVisitStatus="changeVisitStatus"
      :getSessionTop="getSessionTop"
      :getSessionHeight="getSessionHeight"
      :handleOpenRecord="handleOpenRecord"
    />
    <ActivityOut
      :activity="activity"
      :getSessionTop="getSessionTop"
      :getSessionHeight="getSessionHeight"
      :handleOpenActivity="handleOpenActivity"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Slot, Session, IRecord, IActivity } from '../types/calendarType'
import RecordsOut from './RecordsOut.vue'
import ActivityOut from './ActivityOut.vue'

interface Props {
  entityId: string
  timeStartEndArray: number[]
  period?: number
  workSlots: Slot[]
  breakSlots?: Slot[]
  records?: IRecord[]
  activity?: IActivity[]
  changeVisitStatus: (entityId: number, id: number, visitStatus: number) => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  workSlots: () => [],
  breakSlots: () => [],
  records: () => [],
  period: 15,
})

const emit = defineEmits(['clickDate', 'openRecord', 'openActivity'])

const changeVisitStatus = async (id: number, visitStatus: number) => {
  try {
    await props.changeVisitStatus(Number(props.entityId), id, visitStatus)
  } catch (error) {
    console.log('error')
  }
}
const handleOpenRecord = (idSession: number) => {
  emit('openRecord', props.entityId, idSession)
}
const handleOpenActivity = (idSession: number) => {
  emit('openActivity', props.entityId, idSession)
}
/** Безопасно разбирает "HH:MM" → [hours, minutes] */
function parseTime(t: unknown): [number, number] {
  if (typeof t !== 'string') return [0, 0]
  const parts = t.split(':').map((x) => parseInt(x, 10))
  return [parts[0] || 0, parts[1] || 0]
}

/** Преобразует часы+минуты в общие минуты */
function toMinutes(h: number, m: number): number {
  return h * 60 + m
}

/** Форматирует время для кнопки "Новый сеанс" */
function paddedTime(hour: number, idx: number): string {
  const total = hour * 60 + idx * props.period
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// начало оси (в минутах) для абсолютных блоков
const axisStartMin = computed(() => props.timeStartEndArray[0] * 60)

// —————— Рабочие слоты без учёта сеансов ——————

function isInWork(hour: number, idx: number): boolean {
  const t0 = toMinutes(hour, idx * props.period)
  const t1 = t0 + props.period
  return props.workSlots.some((s) => {
    const [h1, m1] = parseTime(s.from)
    const [h2, m2] = parseTime(s.to)
    const w0 = toMinutes(h1, m1)
    const w1 = toMinutes(h2, m2)
    return t0 >= w0 && t1 <= w1
  })
}

// —————— Сеансы (абсолютное позиционирование) ——————

function overlapsSession(t0: number, t1: number): boolean {
  return props.records.some((s) => {
    const [sh, sm] = parseTime(s.from)
    const [eh, em] = parseTime(s.to)
    const s0 = toMinutes(sh, sm)
    const s1 = toMinutes(eh, em)
    return t0 < s1 && t1 > s0
  })
}

function isAvailable(hour: number, idx: number): boolean {
  const t0 = toMinutes(hour, idx * props.period)
  const t1 = t0 + props.period
  return isInWork(hour, idx)
}

// сколько ячеек (по period) занимает сеанс
function getSessionCellCount(s: Session): number {
  const [sh, sm] = parseTime(s.from)
  const [eh, em] = parseTime(s.to)
  const dur = toMinutes(eh, em) - toMinutes(sh, sm)
  return Math.ceil(dur / props.period)
}

// в какой ячейке начинается сеанс
function getSessionStartCell(s: Session): number {
  const [sh, sm] = parseTime(s.from)
  const offset = toMinutes(sh, sm) - axisStartMin.value
  return Math.floor(offset / props.period)
}

function getSessionTop(s: Session): string {
  return `${getSessionStartCell(s) * props.period}px`
}
function getSessionHeight(s: Session): string {
  return `${getSessionCellCount(s) * props.period}px`
}
function getSessionTopWithoutPX(s: Session): number {
  return Number(getSessionStartCell(s) * props.period)
}
// —————— Перерывы ——————

function isInBreak(hour: number, idx: number): boolean {
  const t0 = toMinutes(hour, idx * props.period)
  const t1 = t0 + props.period
  return props.breakSlots.some((b) => {
    const [bh, bm] = parseTime(b.from)
    const [eh, em] = parseTime(b.to)
    const b0 = toMinutes(bh, bm)
    const b1 = toMinutes(eh, em)
    return t0 >= b0 && t1 <= b1
  })
}

function isBreakStartCell(hour: number, idx: number): boolean {
  const t0 = toMinutes(hour, idx * props.period)
  return props.breakSlots.some((b) => {
    const [bh, bm] = parseTime(b.from)
    return toMinutes(bh, bm) === t0
  })
}

function getBreakLabel(hour: number, idx: number): string {
  const t0 = toMinutes(hour, idx * props.period)
  const b = props.breakSlots.find((b) => {
    const [bh, bm] = parseTime(b.from)
    return toMinutes(bh, bm) === t0
  })
  return b ? `${b.from} – ${b.to}` : ''
}

// —————— Нерабочие периоды ——————

const inactiveSlots = computed(() => {
  if (!props.workSlots.length) return [] as { from: number; to: number }[]
  const axisStart = props.timeStartEndArray[0] * 60
  const axisEnd = props.timeStartEndArray.at(-1)! * 60
  const [sh, sm] = parseTime(props.workSlots[0].from)
  const [eh, em] = parseTime(props.workSlots.at(-1)!.to)
  const startW = toMinutes(sh, sm)
  const endW = toMinutes(eh, em)
  const res: { from: number; to: number }[] = []
  if (startW > axisStart) res.push({ from: axisStart, to: startW })
  if (endW < axisEnd) res.push({ from: endW, to: axisEnd })
  return res
})

function isInactiveStartCell(hour: number, idx: number): boolean {
  const t0 = toMinutes(hour, idx * props.period)
  return inactiveSlots.value.some((s) => s.from === t0)
}

function getInactiveLabel(hour: number, idx: number): string {
  const t0 = toMinutes(hour, idx * props.period)
  const s = inactiveSlots.value.find((s) => s.from === t0)!

  const pad = (n: number) => String(n).padStart(2, '0')
  const fromH = pad(Math.floor(s.from / 60)),
    fromM = pad(s.from % 60)
  const toH = pad(Math.floor(s.to / 60)),
    toM = pad(s.to % 60)
  return `${fromH}:${fromM} – ${toH}:${toM}`
}
</script>

<style scoped lang="scss">
.column {
  position: relative;
  width: 100%;
  margin-top: 5px;
  // border: 1px solid black;
  // border-top: none;
}
.row {
  display: flex;
  &:hover {
    .new-session {
      display: flex;
      cursor: pointer;
    }
  }
  &:nth-child(even) {
    border-top: 1px solid var(--chatrex-record-color-border-even);
  }
  &:nth-child(odd) {
    border-top: 1px solid var(--chatrex-record-color-border-odd);
  }
}
.new-session {
  display: none;
  align-items: center;
  background-color: var(--chatrex-record-back-session-time);

  color: var(--chatrex-record-color-new-session);
  font-size: 12px;
  border-radius: 4px;
  padding: 0 4px;
  width: 100%;
}
.disabled {
  background-color: var(--chatrex-record-back-disabled);
  width: 100%;
  height: 100%;
  position: relative;
}
.inactive-label {
  position: absolute;
  top: 0px;
  left: 4px;
  font-size: 10px;
  color: var(--chatrex-record-color-inactive);
}
.time {
  width: 40px;
  font-size: 12px;
}
.InformationWindow {
  position: absolute;
  z-index: 11;
  width: 100%;
  transition: all 0.3s ease-in-out;
}
:deep(.session-abs) {
  .session {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 1;

    background: color-mix(in srgb, var(--chatrex-record-back-session), transparent 20%);
    color: var(--chatrex-record-color-session);
    padding: 4px;
    box-sizing: border-box;
    font-size: 12px;
    transition: all 0.5s ease-in-out;
    overflow: hidden;
    &:has(.wrapper-description:hover) {
      z-index: 2 !important;
      left: 0 !important;
      right: 0 !important;
    }
  }
  .session-activity {
    background: color-mix(in srgb, var(--chatrex-record-back-session-activity), transparent 20%);
  }
  .sessionM {
    margin-right: 1px;
  }
  .wrapper-description {
    height: 95%;
  }

  // .session:hover {
  //   z-index: 2;
  //   left: 0 !important;
  //   right: 0 !important;
  // }
  .session-header {
    display: flex;
    justify-content: space-between;
    background-color: var(--chatrex-record-back-session-time);

    padding: 2px;
    margin: -4px;
    height: 15px;
    align-items: center;
  }
  .session-time {
    font-weight: bold;
    &__icons {
      display: flex;
      gap: 5px;
      i {
        cursor: pointer;
      }
    }
  }
  .session-desc {
    margin-top: 5px;
  }
  .session-comment {
    margin-top: 2px;
    font-size: 10px;
  }
}
</style>
