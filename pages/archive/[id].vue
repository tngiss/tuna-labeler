<template>
  <div>
    <v-container fluid class="full-height">
      <app-bar title="ARCHIVE" :edit="true" @edit="edit" @cancel="cancel" />
      <div class="text-center archive-subheader">
        {{ $route.params.id }}
      </div>
      <v-row class="mt-4">
        <v-col cols="12" class="pa-0">
          <v-list class="bg-transparent">
            <v-list-item
              v-for="(item, index) in labels"
              :key="index"
              class="border-b-sm py-3"
            >
              <template #prepend>
                <div v-show="editStatus">
                  <v-checkbox
                    v-model="selected"
                    :value="item.id"
                    multiple
                    color="primary"
                    density="compact"
                    class="rounded-full"
                    hide-details
                  />
                </div>
                <img
                  :src="item?.url.replace('https://storage.cloud.google.com', 'https://storage.googleapis.com')"
                  class="library-image ml-4"
                >
              </template>

              <v-list-item-title @click="setCurrentLabel(item)">
                <nuxt-link :to="`/archive/detail/${item.id}`">
                  <div class="ml-4">
                    <div class="text-caption font-weight-medium">
                      {{ new Date(item.created).toLocaleString("ja") }}
                    </div>
                    <!-- <div class="text-caption font-weight-bold">
                      NAME: {{ item.rank_name }}
                    </div> -->
                    <div class="text-caption font-weight-medium">
                      RANK: {{ item.rank }}
                    </div>
                  </div>
                </nuxt-link>
              </v-list-item-title>
            </v-list-item>
            <!-- <v-divider class="mt-1 px-0 mx-0" /> -->
          </v-list>
        </v-col>
      </v-row>
      <v-btn
        icon
        location="left bottom"
        position="absolute"
        color="white"
        class="back-button ma-4"
        density="compact"
        to="/archive"
        :style="{ width: '30px', height: '30px' }"
      >
        <v-icon size="16" class="ml-1">
          arrow_back_ios
        </v-icon>
      </v-btn>
    </v-container>
    <div v-if="selected.length" class="button-bottom-wrapper text-center">
      <v-btn
        flat
        color="primary"
        class="font-weight-bold px-8 text-11"
        @click="deleteMethod"
      >
        Delete
      </v-btn>
    </div>
  </div>
</template>
<script>
import { labelListByDate, deleteById } from '@/services/api'
import { useGlobalStore } from '@/store/global'
export default {
  setup () {
    definePageMeta({
      middleware: ['auth']
    })
  },
  data () {
    return {
      editStatus: false,
      selected: [],
      labels: []
    }
  },
  mounted () {
    this.list()
  },
  methods: {
    edit () {
      this.editStatus = true
    },
    cancel () {
      this.selected = []
      this.editStatus = false
    },
    list () {
      labelListByDate(this.$route.params.id, 1).then((response) => {
        this.labels = response.data.labels
      })
    },
    deleteMethod () {
      deleteById(this.selected).then(() => {
        this.list()
        this.selected = []
        this.editStatus = false
      })
    },
    setCurrentLabel (item) {
      useGlobalStore().$patch({
        selectedLabel: item
      })
    }
  }
}
</script>
