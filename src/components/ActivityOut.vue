<template>
  <div v-for="session in activity" :key="`${session.from}-${session.to}`" class="session-abs">
    <div
      v-if="!session?.sessionArray"
      class="session session-activity session-activity"
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
          <el-icon><Setting @click="handleOpenActivity(session.id)" /></el-icon>

          <el-popover :width="200">
            <template #reference>
              <el-icon><InfoFilled /></el-icon>
            </template>
            <template #default>
              <InformationWindowActivity :session="session" />
            </template>
          </el-popover>
        </div>
      </div>

      <div class="session-desc">
        {{ `${session.recordsCount}/${session.capacity} ${session.serviceName}` }}
      </div>
    </div>
    <div v-else-if="session?.sessionArray" class="session-merged">
      <div
        v-for="(mergedActivity, i) in session.sessionArray"
        :key="i"
        class="session sessionM session-activity"
        :style="{
          ...(mergedActivity?.backColor && {
            background: `color-mix(in srgb, ${mergedActivity.backColor}, transparent 20%)`,
          }),
          top: getSessionTop(mergedActivity),
          height: getSessionHeight(mergedActivity),
          left: `${i * (100 / (session.sessionArray?.length ?? 1))}%`,
          right: `${100 - (i + 1) * (100 / (session.sessionArray?.length ?? 1))}%`,
        }"
      >
        <div class="session-header">
          <div class="session-time">{{ mergedActivity.from }} – {{ mergedActivity.to }}</div>
          <div class="session-time__icons">
            <el-icon><Setting @click="handleOpenActivity(mergedActivity.id)" /></el-icon>
            <el-popover :width="200">
              <template #reference>
                <el-icon><InfoFilled /></el-icon>
              </template>
              <template #default>
                <InformationWindowActivity :session="mergedActivity" />
              </template>
            </el-popover>
          </div>
        </div>
        <div class="wrapper-description">
          <div class="session-desc">
            {{
              `${mergedActivity.recordsCount}/${mergedActivity.capacity} ${mergedActivity.serviceName}`
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IActivity } from '../types/calendarType'
import { InfoFilled, Setting } from '@element-plus/icons-vue'
import InformationWindowActivity from './InformationWindowActivity.vue'
interface Props {
  activity?: IActivity[] | []
  getSessionTop: (session: IActivity) => string
  getSessionHeight: (session: IActivity) => string
  handleOpenActivity: (id: number) => void
}
defineProps<Props>()
</script>
