<template>
  <div v-for="session in records" :key="`${session.from}-${session.to}`" class="session-abs">
    <div
      v-if="!session?.sessionArray"
      class="session"
      :style="{
        top: getSessionTop(session),
        height: getSessionHeight(session),
        ...(session?.backColor && {
          background: `color-mix(in srgb, ${session.backColor}, transparent 20%)`,
        }),
      }"
    >
      <div class="session-header">
        <div class="session-time">{{ session.from }} – {{ session.to }}</div>
        <div class="session-time__icons">
          <el-icon><Setting @click="handleOpenRecord(session.id)" /></el-icon>

          <el-popover :width="500">
            <template #reference>
              <el-icon><InfoFilled /></el-icon>
            </template>
            <template #default>
              <InformationWindow
                :key="session.id"
                :session="session"
                :changeVisitStatus="changeVisitStatus"
              />
            </template>
          </el-popover>
        </div>
      </div>

      <div v-if="session?.caption" class="session-desc">{{ session.caption }}</div>
      <div v-if="session.description" class="session-comment">{{ session.description }}</div>
    </div>
    <div v-else-if="session?.sessionArray" class="session-merged">
      <div
        v-for="(mergedRecord, i) in session.sessionArray"
        :key="i"
        class="session sessionM"
        :style="{
          ...(mergedRecord?.backColor && {
            background: `color-mix(in srgb, ${mergedRecord.backColor}, transparent 20%)`,
          }),
          top: getSessionTop(mergedRecord),
          height: getSessionHeight(mergedRecord),
          left: `${i * (100 / (session.sessionArray?.length ?? 1))}%`,
          right: `${100 - (i + 1) * (100 / (session.sessionArray?.length ?? 1))}%`,
        }"
      >
        <div class="session-header">
          <div class="session-time">{{ mergedRecord.from }} – {{ mergedRecord.to }}</div>
          <div class="session-time__icons">
            <el-icon><Setting @click="handleOpenRecord(mergedRecord.id)" /></el-icon>
            <el-popover :width="500">
              <template #reference>
                <el-icon><InfoFilled /></el-icon>
              </template>
              <template #default>
                <InformationWindow :session="mergedRecord" :changeVisitStatus="changeVisitStatus" />
              </template>
            </el-popover>
          </div>
        </div>
        <div class="wrapper-description">
          <div v-if="mergedRecord?.caption" class="session-desc">{{ mergedRecord.caption }}</div>
          <div v-if="mergedRecord?.description" class="session-comment">
            {{ mergedRecord.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IRecord } from '../types/calendarType'
import { InfoFilled, Setting } from '@element-plus/icons-vue'
import InformationWindow from './InformationWindow.vue'
interface Props {
  records: IRecord[]
  changeVisitStatus: (id: number, visitStatus: number) => Promise<void>
  getSessionTop: (session: IRecord) => string
  getSessionHeight: (session: IRecord) => string
  handleOpenRecord: (id: number) => void
}
defineProps<Props>()
</script>
