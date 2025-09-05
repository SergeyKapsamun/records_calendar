<template>
  <RecordCalendar
    :entities="entities"
    :period="15"
    @clickDate="clickDate"
    @openRecord="openRecord"
    @openActivity="openActivity"
    :changeVisitStatus="changeVisitStatus"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RecordCalendar from './RecordCalendar.vue'
import type { Entity } from '@/types/calendarType'

const clickDate = (e: any, entityId: number, hours: number, minutes: number) => {
  console.log('entityId', entityId)
  console.log('hours', hours)
  console.log('minutes', minutes)
}
const changeVisitStatus = async (entityId: number, id: number, visitStatus: number) => {
  await new Promise((res) => setTimeout(res, 500))
  if (!entities.value[entityId]?.records) return
  entities.value[entityId]?.records.map((item) => {
    if (item.id === id) {
      item.visitStatus = visitStatus
    }
    return item
  })
}

const openRecord = (entityId: number, idSession: number) => {
  console.log('openRecord', entityId, idSession)
}
const openActivity = (entityId: number, idSession: number) => {
  console.log('openActivity', entityId, idSession)
}
const entities = ref<Record<number, Entity>>({
  3880733: {
    id: 3880733,
    caption: 'Ребячий Антон',
    description: 'Педиатрия',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbk_6yU0eH50-u5Faa1VzDo8wI000jZaEjrA&s',
    workSlots: [{ from: '09:00', to: '18:00' }],
    records: [
      {
        id: 1,
        from: '09:00',
        to: '10:00',
        caption: 'Прием',
        description: 'Обычный прием',
        backColor: '#29ccbf',
        services: ['Стрижка машинкой', 'Стрижка бороды'],
        visitStatus: 0,
        cost: '3900 Юаней',
        details: ['11:15–12:00 · 45 мин.', '11:15–12:00 · 45 мин.'],
      },
      {
        id: 2,
        from: '09:00',
        to: '12:00',
        caption: 'Прием245',
        description: 'Обычный прием',
        backColor: '#29ccbf',
        services: ['Стрижка машинкой', 'Стрижка бороды'],
        visitStatus: 0,
        cost: '2500 денег',
        details: ['11:15–12:00 · 45 мин.', '11:15–12:00 · 45 мин.'],
      },
    ],
    activity: [
      {
        id: 123,
        from: '12:00',
        to: '13:00',
        backColor: '#29ccbf',
        capacity: 10,
        recordsCount: 5,
        serviceName: 'Test Service',
      },
      {
        id: 123,
        from: '14:00',
        to: '15:00',

        capacity: 10,
        recordsCount: 5,
        serviceName: 'Test Service Color',
      },
      {
        id: 123,
        from: '14:00',
        to: '16:00',

        capacity: 10,
        recordsCount: 9,
        serviceName: 'Test Service',
      },
    ], // пока пустой, в будущем тут будут события
  },
  2935587: {
    id: 2935587,
    caption: 'Борис',
    description: 'Барбер',
    avatar: '',
    workSlots: [{ from: '10:00', to: '15:00' }],
    records: [
      {
        id: 5678,
        from: '10:00',
        to: '11:00',
        caption: 'Стрижка',
        description: 'Стрижка машинкой',
        backColor: null,
        services: ['Стрижка машинкой', 'Стрижка бороды'],
        visitStatus: 0,
        cost: '33500 Долла',
        details: ['11:15–12:00 · 45 мин.', '11:15–12:00 · 45 мин.'],
      },
      {
        id: 5678,
        from: '12:00',
        to: '12:15',
        caption: 'Стрижка',
        description: 'Стрижка машинкой',
        backColor: null,
        services: ['Стрижка машинкой', 'Стрижка бороды'],
        visitStatus: 0,
        cost: '113500 Руб',
        details: ['11:15–12:00 · 45 мин.', '11:15–12:00 · 45 мин.'],
      },
    ],
    activity: [], // пока пустой, в будущем тут будут события
  },
})
</script>

<style>
html {
  --chatrex-record-back-calendar: white;
  --chatrex-record-back-session-time: #1ab293;
  --chatrex-record-back-session: #8be0ce;
  --chatrex-record-back-disabled: #cacaca;
  --chatrex-record-color-new-session: white;
  --chatrex-record-color-session: black;
  --chatrex-record-color-inactive: #333;
  --chatrex-record-color-border-even: rgb(73, 73, 73);
  --chatrex-record-color-border-odd: rgb(122, 121, 121);
  --chatrex-record-color-staff: black;
}
</style>
