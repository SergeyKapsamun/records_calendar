<template>
  <div class="header-calendar">
    <div
      class="entity"
      v-for="[id, entity] in Object.entries(entities)"
      :key="id"
      :style="{ width: widthEntities + '%' }"
    >
      <img v-if="entity?.avatar" :src="entity?.avatar" alt="avatar" />
      <div>
        <div class="caption">{{ entity?.caption }}</div>
        <div>{{ entity.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Entity } from '../types/calendarType'
const { entities } = defineProps<{ entities: Record<number, Entity> }>()
const widthEntities = computed(() => 100 / Object.values(entities).length)
</script>

<style scoped lang="scss">
.header-calendar {
  margin: auto 53px;
  display: flex;
  gap: 10px;
  .entity {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: var(--color-staff);
    font-size: 12px;
    img {
      height: 50px;
      border-radius: 10%;
    }
    .caption {
      font-weight: 600;
    }
  }
}
</style>
