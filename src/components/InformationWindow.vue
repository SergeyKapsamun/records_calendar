<template>
  <div class="information-window">
    <div class="information-window__controls">
      <el-button
        :disabled="disabled"
        :type="isActive(VisitStatus.WAIT)"
        @click="() => handleChangeVisitStatus(VisitStatus.WAIT)"
        >Ожидание</el-button
      >
      <el-button
        :disabled="disabled"
        :type="isActive(VisitStatus.CLIENT_COME)"
        @click="() => handleChangeVisitStatus(VisitStatus.CLIENT_COME)"
        :loading="isLoadingButton[VisitStatus.CLIENT_COME]"
        >Пришел</el-button
      >
      <el-button
        :disabled="disabled"
        :type="isActive(VisitStatus.CLIENT_NO_COME)"
        @click="() => handleChangeVisitStatus(VisitStatus.CLIENT_NO_COME)"
        :loading="isLoadingButton[VisitStatus.CLIENT_NO_COME]"
        >Не пришел</el-button
      >
      <el-button
        :disabled="disabled"
        :type="isActive(VisitStatus.CONFIRMED)"
        @click="() => handleChangeVisitStatus(VisitStatus.CONFIRMED)"
        :loading="isLoadingButton[VisitStatus.CONFIRMED]"
        >Подтвердил</el-button
      >
    </div>
    <div class="information-window__details">
      <div class="information-window__section">
        <div class="information-window__section-title">Услуга</div>
        <template v-for="(service, index) in session.services" :key="index">
          <div class="information-window__section-item">{{ service }}</div>
        </template>
      </div>
      <div class="information-window__section">
        <div class="information-window__section-title">Итого</div>
        <div class="information-window__section-item">{{ session.cost }}</div>
      </div>
      <div class="information-window__section">
        <div class="information-window__section-title">Детали записи</div>
        <template v-for="(detail, index) in session.details" :key="index">
          <div class="information-window__section-item">
            {{ detail }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { IRecord } from '../types/calendarType'
import { VisitStatus } from '../types/calendarType'

const props = defineProps<{
  session: IRecord
  changeVisitStatus: (id: number, visitStatus: number) => Promise<void>
}>()
const isLoadingButton = ref<Record<number, boolean>>({})
const isActive = (status: number) => {
  return props.session.visitStatus === status ? 'primary' : 'default'
}
const handleChangeVisitStatus = async (visitStatus: number) => {
  if (isLoadingButton.value[visitStatus] || visitStatus == props.session.visitStatus) return
  disabled.value = true
  isLoadingButton.value[visitStatus] = true
  try {
    await props.changeVisitStatus(props.session.id, visitStatus)
  } catch (error) {
    console.log(error)
  } finally {
    isLoadingButton.value[visitStatus] = false
    disabled.value = false
  }
}

const disabled = ref(false)
</script>
<style lang="scss" scoped>
.information-window {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: white;
  box-shadow: 0px 4px 32px 0px #505a6e1a;
  &__controls {
    display: flex;
  }
  &__details {
    display: flex;
    flex-direction: column;
  }
  .information-window__section {
    display: flex;
    flex-direction: column;

    .information-window__section-title {
      color: #a0a3a7;
    }
    .information-window__section-item {
      color: #2d2f34;
      font-weight: 600;
    }
  }
}
</style>
