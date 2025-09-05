<template>
  <div class="wrapper-watch-log">
    <WatchLog :period="period" :timeStartEndArray="timeStartEndArray" />
    <slot></slot>
    <WatchLog :period="period" :timeStartEndArray="timeStartEndArray" />
  </div>
</template>

<script setup lang="ts">
import WatchLog from './WatchLog.vue'
interface Props {
  minMaxTime: object
  period?: number
  timeStartEndArray: Array<number>
}
withDefaults(defineProps<Props>(), {
  period: 15,
})
</script>

<style>
.wrapper-watch-log {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}
</style>
