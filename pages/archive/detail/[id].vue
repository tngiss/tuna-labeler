<template>
  <div>
    <v-container fluid class="full-height">
      <app-bar title="ARCHIVE" :edit="false" />
      <v-row>
        <v-col cols="12">
          <img
            :src="selectedLabel?.url.replace('https://storage.cloud.google.com', 'https://storage.googleapis.com')"
            class="archive-detail-image"
          >
        </v-col>
        <v-col cols="12" class="pa-0 px-4">
          <v-row dense class="font-weight-medium text-16">
            <v-col cols="3" class="font-weight-medium text-16">
              DATE
            </v-col>
            <v-col cols="9" class="font-weight-medium text-16">
              {{ new Date(selectedLabel.created).toLocaleDateString("ja") }}
            </v-col>
            <!-- <v-col cols="3" class="font-weight-medium text-16"> NAME </v-col>
            <v-col cols="9" class="font-weight-medium text-16">
              {{ selectedLabel.rank_name }}
            </v-col> -->
            <v-col cols="3" class="font-weight-medium text-16">
              RANK
            </v-col>
            <v-col cols="9" class="font-weight-medium text-16">
              {{ selectedLabel.rank }}
            </v-col>
            <v-col cols="3" class="font-weight-medium text-16">
              MEMO
            </v-col>
            <v-col cols="9" class="font-weight-medium text-16">
              {{ selectedLabel.memo }}
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-btn
        icon
        location="left bottom"
        position="absolute"
        color="white"
        class="back-button ma-4"
        density="compact"
        :style="{ width: '30px', height: '30px' }"
        @click="$router.go(-1)"
      >
        <v-icon size="16" class="ml-1">
          arrow_back_ios
        </v-icon>
      </v-btn>
    </v-container>
  </div>
</template>
<script>
import { mapState } from 'pinia'
import { useGlobalStore } from '@/store/global'
export default {
  setup () {
    definePageMeta({
      middleware: ['auth']
    })
  },
  computed: {
    ...mapState(useGlobalStore, ['selectedLabel'])
  }
}
</script>
