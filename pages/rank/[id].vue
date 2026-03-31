<template>
  <div>
    <v-container fluid>
      <app-bar
        title="SETTING"
        :edit="false"
        :delete-state="true"
        @delete="deleteMethod"
      />
      <div class="settings-rank-wrapper mt-8">
        <v-row>
          <v-col cols="12">
            <div class="text-uppercase text-subtitle-2 mb-2">
              Rank Name
            </div>
            <v-text-field
              v-model="rankName"
              :loading="rankLoading"
              class="settings-bg-button"
              hide-details
            />
          </v-col>
          <v-col cols="12" class="my-6">
            <div v-for="i in 8" :key="i" class="d-flex mb-2">
              <div class="align-self-center mr-4 font-weight-bold">
                {{ i }}
              </div>
              <v-text-field
                v-model="ranks[i - 1]"
                :loading="rankLoading"
                class="settings-bg-button"
                hide-details
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
    <div class="button-bottom-wrapper text-center">
      <v-btn
        flat
        color="greyButton"
        class="font-weight-bold px-8 mr-4"
        @click="navigateTo('/setting')"
      >
        Back
      </v-btn>
      <v-btn
        :loading="rankEditLoading"
        flat
        color="primary"
        class="font-weight-bold px-8"
        @click="edit"
      >
        Save
      </v-btn>
    </div>
    <v-dialog v-model="requiredFieldError">
      <v-card class="bg-white">
        <v-card-title class="text-h6 text-center">
          Please fill in all fields.
        </v-card-title>
        <v-card-text class="text-center">
          <v-btn
            color="primary"
            flat
            class="font-weight-bold w-122px"
            @click="requiredFieldError = false"
          >
            OK
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { getRanks, editRank, deleteRank } from '@/services/api'
export default {
  setup () {
    definePageMeta({
      middleware: ['auth']
    })
  },
  data () {
    return {
      rankName: null,
      ranks: [],
      rankLoading: false,
      rankEditLoading: false,
      requiredFieldError: false
    }
  },
  mounted () {
    this.getRank()
  },
  methods: {
    deleteMethod () {
      deleteRank(this.$route.params.id).then(() => {
        const currentRank = localStorage.getItem('selectedRank')
        if (Number(currentRank) === Number(this.$route.params.id)) {
          localStorage.removeItem('selectedRank')
        }
        this.$router.push('/setting')
      })
    },
    getRank () {
      this.rankLoading = true
      getRanks(this.$route.params.id).then((response) => {
        this.rankName = response.data.rank_name
        this.ranks = response.data.ranks
        this.rankLoading = false
      })
    },
    edit () {
      this.ranks = this.ranks.filter(rank => rank !== '')
      if (
        !this.ranks.length ||
        this.rankName === null
      ) {
        this.requiredFieldError = true
        return
      }
      this.rankEditLoading = true
      editRank(this.$route.params.id, {
        rank_name: this.rankName,
        ranks: this.ranks
      }).then(() => {
        this.rankEditLoading = false
        this.$router.push('/setting')
      })
    }
  }
}
</script>
