<template>
  <v-container fluid>
    <app-bar title="SETTING" :edit="false" :add="true" @add="add" />
    <div class="settings-wrapper">
      <v-row class="justify-center mb-16">
        <v-col cols="12">
          <div class="text-uppercase font-weight-bold text-center text-16">
            Select Rank Setting
          </div>
        </v-col>
        <v-col v-if="rankSetStatus" cols="12">
          <v-alert density="compact" type="success">
            Rank has been set successfully.
          </v-alert>
        </v-col>
        <v-col cols="12" class="px-10">
          <v-select
            v-model="rank"
            :items="ranks"
            :loading="rankLoading"
            item-title="rank_name"
            item-value="id"
            hide-details
            placeholder="select rank..."
            class="bg-grey-darken-2"
            variant="outlined"
            density="compact"
          />
        </v-col>
        <v-col cols="8" class="text-center">
          <v-btn
            color="primary"
            class="font-weight-bold text-uppercase text-11"
            width="180"
            :style="{ width: '160px', height: '60px' }"
            @click="select"
          >
            Select
          </v-btn>
          <v-btn
            color="greyButton"
            class="font-weight-bold text-uppercase mt-2"
            width="180"
            :style="{ width: '160px', height: '60px' }"
            @click="editRank"
          >
            Edit・Delete
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <v-dialog v-model="dialog.state" persistent max-width="400">
      <v-card>
        <v-card-text>
          <div class="text-h6 font-weight-bold mb-2">
            ADD NEW RANK
          </div>
          <v-text-field
            v-model="newRank"
            class="bg-white"
            density="compact"
            hide-details
            placeholder="Enter new rank..."
          />
          <div class="text-right mt-4">
            <v-btn
              color="greyButton"
              class="font-weight-bold text-uppercase"
              @click="dialog.state = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              class="ml-2 font-weight-bold text-uppercase"
              @click="create"
            >
              OK
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { mapState } from 'pinia'
import { useGlobalStore } from '@/store/global'
import { rankList, rankCreate } from '@/services/api'
export default {
  setup () {
    definePageMeta({
      middleware: ['auth']
    })
  },
  data () {
    return {
      ranks: [],
      rank: '',
      newRank: '',
      rankLoading: false,
      rankSetStatus: false
    }
  },
  computed: {
    ...mapState(useGlobalStore, ['dialog'])
  },
  mounted () {
    this.list()
  },
  methods: {
    openDialog () {
      useGlobalStore().$patch({
        dialog: {
          state: true
        }
      })
    },
    create () {
      rankCreate({
        rank_name: this.newRank,
        ranks: []
      }).then(() => {
        this.dialog.state = false
        this.list()
      })
    },
    add () {
      this.openDialog()
    },
    editRank () {
      navigateTo(`/rank/${this.rank}`)
    },
    select () {
      localStorage.setItem('selectedRank', this.rank)
      this.rankSetStatus = true
      setTimeout(() => {
        this.rankSetStatus = false
      }, 3000)
    },
    list () {
      this.rankLoading = true
      rankList().then((response) => {
        this.ranks = response.data
        if (localStorage.getItem('selectedRank')) {
          this.rank = Number(localStorage.getItem('selectedRank'))
        } else {
          this.rank = this.ranks[0].id
          localStorage.setItem('selectedRank', this.ranks[0].id)
        }
        this.rankLoading = false
      })
    }
  }
}
</script>
