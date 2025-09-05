<template>
  <div class="wrapper-hours">
    <div
      class="hours"
      :style="{ height: `${period * Math.ceil(60 / period)}px` }"
      v-for="i in timeStartEndArray"
      :key="i"
    >
      <div class="hour">
        <span>{{ pad(i) }}</span
        >:00
      </div>
      <div class="minute">
        {{ i != timeStartEndArray[timeStartEndArray.length - 1] ? '30' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  timeStartEndArray: Array<number>
  period: number
}

const props = defineProps<Props>()
const pad = (n: number) => String(n).padStart(2, '0')
</script>
<style lang="scss">
.wrapper-hours {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
}
.hours {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  span {
    font-weight: 900;
  }
}
.minute {
  margin-bottom: 12px;
}
</style>
