<template>
  <div class="recordCalendar">
    <HeaderCalendar :entities="entities" />
    <WrapperWatchLog
      v-if="dayRange"
      :minMaxTime="{ min: dayRange.minHour, max: dayRange.maxHour }"
      :period="period"
      :timeStartEndArray="timeStartEndArray"
    >
      <Column
        v-for="[id, values] in Object.entries(entities)"
        :key="id"
        :entityId="id"
        :timeStartEndArray="timeStartEndArray"
        :workSlots="values.workSlots || []"
        :breakSlots="values.breakSlots || []"
        :records="sessionRecordMerged[Number(id)] || []"
        :activity="sessionActivityMerged[Number(id)] || []"
        :period="period"
        @clickDate="handleClickDate"
        @openRecord="handleOpenRecord"
        @openActivity="handleOpenActivity"
        :changeVisitStatus="changeVisitStatus"
      />
    </WrapperWatchLog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Column from './Column.vue'
import HeaderCalendar from './HeaderCalendar.vue'
import type { InfoCalendar, IRecord, IActivity } from '../types/calendarType'
import WrapperWatchLog from './WrapperWatchLog.vue'

const { period, entities } = defineProps<InfoCalendar>()

const emit = defineEmits(['clickDate', 'openRecord', 'openActivity'])

const handleClickDate = ($event: any, entityId: number, hours: number, minutes: number) => {
  emit('clickDate', $event, entityId, hours, minutes)
}

const handleOpenRecord = (entityId: number, idSession: number) => {
  emit('openRecord', entityId, idSession)
}

const handleOpenActivity = (entityId: number, idSession: number) => {
  emit('openActivity', entityId, idSession)
}

// Преобразует время в формате "HH:MM" в минуты
const toMin = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Форматирует минуты обратно в "HH:MM"
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

// Вычисляет диапазон рабочих часов для всех сотрудников
const dayRange = computed(() => {
  const allWorkSlots = Object.values(entities)
    .flatMap((entity) => entity.workSlots || [])
    .filter(Boolean)

  if (!allWorkSlots.length) return null

  const minStart = Math.min(...allWorkSlots.map((slot) => toMin(slot.from)))
  const maxEnd = Math.max(...allWorkSlots.map((slot) => toMin(slot.to)))

  return {
    minHour: Math.floor(minStart / 60),
    maxHour: Math.ceil(maxEnd / 60),
  }
})

// Создает массив часов для отображения на временной оси
const timeStartEndArray = computed(() => {
  if (!dayRange.value) return []
  const { minHour, maxHour } = dayRange.value
  return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i)
})

// Общая функция для объединения пересекающихся сессий
const mergeOverlappingSessions = <T extends { from: string; to: string }>(
  sessions: T[],
  mergeHandler: (mergedSessions: T[], minTime: number, maxTime: number) => T,
): T[] => {
  if (!sessions.length) return []

  const sortedSessions = [...sessions].sort((a, b) => toMin(a.from) - toMin(b.from))
  const merged: T[] = []
  const processed = new Array(sortedSessions.length).fill(false)

  for (let i = 0; i < sortedSessions.length; i++) {
    if (processed[i]) continue

    const current = sortedSessions[i]
    let minTime = toMin(current.from)
    let maxTime = toMin(current.to)
    const group = [current]
    processed[i] = true

    // Ищем все пересекающиеся сессии
    for (let j = i + 1; j < sortedSessions.length; j++) {
      if (processed[j]) continue

      const next = sortedSessions[j]
      const nextStart = toMin(next.from)
      const nextEnd = toMin(next.to)

      if (minTime < nextEnd && maxTime > nextStart) {
        minTime = Math.min(minTime, nextStart)
        maxTime = Math.max(maxTime, nextEnd)
        group.push(next)
        processed[j] = true
      }
    }

    // Добавляем в результат либо объединенную группу, либо одиночную сессию
    merged.push(group.length > 1 ? mergeHandler(group, minTime, maxTime) : current)
  }

  return merged
}

// Объединенные записи (records)
const sessionRecordMerged = computed(() => {
  return Object.entries(entities).reduce(
    (acc, [id, slots]) => {
      if (!slots.records?.length) return acc

      acc[Number(id)] = mergeOverlappingSessions<IRecord>(
        slots.records,
        (group, minTime, maxTime) => ({
          from: formatTime(minTime),
          to: formatTime(maxTime),
          sessionArray: group.sort((a, b) => toMin(a.from) - toMin(b.from)),
          id: 0,
          services: group.flatMap((s) => s.services),
          visitStatus: group[0].visitStatus || 0,
          cost: group[0].cost || '0',
          details: group.flatMap((s) => s.details),
        }),
      )

      return acc
    },
    {} as Record<number, IRecord[]>,
  )
})

// Объединенные активности (activity)
const sessionActivityMerged = computed(() => {
  return Object.entries(entities).reduce(
    (acc, [id, slots]) => {
      if (!slots.activity?.length) return acc

      acc[Number(id)] = mergeOverlappingSessions<IActivity>(
        slots.activity,
        (group, minTime, maxTime) => ({
          from: formatTime(minTime),
          to: formatTime(maxTime),
          sessionArray: group.sort((a, b) => toMin(a.from) - toMin(b.from)),
          capacity: 0,
          recordsCount: 0,
          id: 0,
          serviceName: '',
        }),
      )

      return acc
    },
    {} as Record<number, IActivity[]>,
  )
})
</script>

<style scoped lang="scss">
.recordCalendar {
  --chatrex-record-back-calendar: white;
  --chatrex-record-back-session-time: #1ab293;
  --chatrex-record-back-session: #8be0ce;
  --chatrex-record-back-session-activity: green;
  --chatrex-record-back-disabled: #eeeff4;
  --chatrex-record-color-new-session: white;
  --chatrex-record-color-session: black;
  --chatrex-record-color-inactive: #333;
  --chatrex-record-color-border-even: #e0e3eb;
  --chatrex-record-color-border-odd: #eeeeee;
  --chatrex-record-color-staff: black;

  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--chatrex-record-back-calendar);

  * {
    box-sizing: inherit;
  }
}
</style>
