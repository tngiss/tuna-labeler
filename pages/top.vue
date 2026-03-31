<template>
  <v-container fluid class="top-bg">
    <v-btn
      flat
      icon
      color="transparent"
      position="absolute"
      location="right top"
      class="ma-2 text-black"
      to="/setting"
    >
      <v-icon>more_horiz</v-icon>
    </v-btn>
    <v-row class="top-wrapper">
      <v-col cols="12" class="text-center mb-4">
        <img src="~/assets/images/logo.svg" class="fade-in-image">
      </v-col>
      <v-col cols="8" offset="2">
        <v-btn
          block
          size="x-large"
          class="d-flex my-2 font-weight-bold text-black menu-button-wrapper"
          variant="outlined"
          to="/camera"
        >
          <img
            src="~/assets/images/camera.png"
            class="menu-icon align-self-center ml-10 mr-6"
          >
          CAMERA
        </v-btn>
        <v-btn
          block
          size="x-large"
          class="d-flex my-2 font-weight-bold text-black menu-button-wrapper"
          variant="outlined"
          @click="selectImage"
        >
          <img
            src="~/assets/images/library.png"
            class="menu-icon align-self-center ml-10 mr-6"
          >
          <input
            id="file_selection"
            type="file"
            accept="image/*"
            class="camera_input"
            @change="fileInput"
          >
          LIBRARY
        </v-btn>
        <v-btn
          block
          size="x-large"
          class="d-flex my-2 font-weight-bold text-black menu-button-wrapper"
          variant="outlined"
          to="/archive"
        >
          <img
            src="~/assets/images/archive.png"
            class="menu-icon align-self-center ml-10 mr-6"
          >
          ARCHIVE
        </v-btn>
      </v-col>
      <v-col cols="12" class="text-center text-black font-weight-bold">
        <nuxt-link to="/setting">
          <div class="mb-2">
            {{ selectedRank }}
          </div>
          <div>
            {{ email }}
          </div>
        </nuxt-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useCameraStore } from '@/store/camera'
import { rankList } from '@/services/api'
export default {
  setup () {
    definePageMeta({
      middleware: ['auth']
    })
  },
  data () {
    return {
      ranks: [],
      selectedRankId: null
    }
  },
  computed: {
    email: {
      get () {
        const jwt = localStorage.getItem('accessToken')
        const [, payload] = jwt.split('.')
        const decodedPayload = JSON.parse(atob(payload))
        return decodedPayload.email?.split('@')[0]
      }
    },
    selectedRank: {
      get () {
        const rankName = this.ranks.find(rank => rank.id === Number(this.selectedRankId))?.rank_name
        return rankName ?? 'ABMC Setting'
      }
    }
  },
  mounted () {
    this.list()
    if (localStorage.getItem('selectedRank')) {
      this.selectedRankId = localStorage.getItem('selectedRank')
    }
  },
  methods: {
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
    },
    selectImage () {
      const input = document.getElementById('file_selection')
      input.click()
    },
    fileInput (e) {
      const imageFile = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      reader.onload = (event) => {
        useCameraStore().$patch({
          imageSource: event.target.result
        })
        this.$router.push('/camera')
      }
    }
  }
}
</script>
