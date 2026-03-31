<template>
  <div>
    <v-container fluid class="full-height">
      <app-bar title="ARCHIVE" :edit="true" @edit="edit" @cancel="cancel" />
      <v-row class="mt-4">
        <v-col cols="12" class="pa-0">
          <v-list class="bg-transparent">
            <v-list-item
              v-for="(date, index) in dates"
              :key="index"
              class="pa-0 border-b-sm pl-4"
            >
              <template #prepend>
                <div v-show="editStatus" class="">
                  <v-icon
                    :color="selected.includes(date) ? 'primary' : 'grey'"
                    @click="toggleSelect(date)"
                  >
                    {{
                      selected.includes(date)
                        ? "check_circle"
                        : "radio_button_unchecked"
                    }}
                  </v-icon>
                </div>
              </template>
              <v-list-item-title>
                <div class="ml-4">
                  <nuxt-link :to="`/archive/${date}`">
                    {{ date }}
                  </nuxt-link>
                </div>
              </v-list-item-title>
            </v-list-item>
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
        to="/top"
        :style="{ width: '30px', height: '30px' }"
      >
        <v-icon size="16" class="ml-1">
          arrow_back_ios
        </v-icon>
      </v-btn>
    </v-container>
    <div
      v-if="selected.length"
      class="button-bottom-wrapper text-center"
      @click="deleteMethod"
    >
      <v-btn flat color="primary" class="font-weight-bold px-8">
        Delete
      </v-btn>
    </div>
  </div>
</template>

<script>
import { labelList, deleteByDate } from '@/services/api'
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
      dates: []
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
    toggleSelect (date) {
      if (this.selected.includes(date)) {
        this.selected = this.selected.filter(item => item !== date)
      } else {
        this.selected.push(date)
      }
    },
    deleteMethod () {
      deleteByDate(this.selected).then(() => {
        this.list()
        this.selected = []
        this.editStatus = false
      })
    },
    list () {
      labelList(1).then((response) => {
        const data = response.data.labels
        this.dates = data.map((date) => {
          const d = new Date(date.created)
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })
        this.dates = [...new Set(this.dates)]
      })
    }
  }
}
</script>
