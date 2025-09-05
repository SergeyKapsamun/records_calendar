<template>
  <div class="information-window">
    <div class="information-window__time">
      <span class="time">{{ session.from }} – {{ session.to }}</span>
    </div>
    <hr />
    <div class="information-window__details">
      {{ `${session.recordsCount}/${session.capacity} ${session.serviceName}` }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IActivity } from '../types/calendarType'

defineProps<{
  session: IActivity
}>()
</script>
<style lang="scss" scoped>
.information-window {
  display: flex;
  flex-direction: column;

  align-items: center;

  padding: 15px;
  background-color: white;
  box-shadow: 0px 4px 32px 0px #505a6e1a;
  hr {
    width: 100%;
  }
  &__time {
    display: flex;
    font-size: 16px;
    font-weight: 900;
    color: black;
  }
}
</style>
