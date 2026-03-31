<template>
  <v-container
    fluid
    class="camera_container pa-0 full-height d-flex flex-column overflow-hidden"
  >
    <!-- <div class="flex-0-1 pa-2 z-100">
      <v-btn icon color="transparent" to="/top">
        <v-icon color="white"> home </v-icon>
      </v-btn>
    </div> -->
    <div class="camera_circle_container">
      <img
        id="camera_circle"
        src="~/assets/images/circle.png"
        class="camera_circle"
      >
    </div>
    <video id="video" />
    <canvas id="canvas" />
    <img id="canvas-image" class="canvas-image">
    <div class="utility-wrapper bg-black justify-center align-center">
      <v-row class="mx-4">
        <v-col
          cols="3"
          class="align-self-center text-uppercase text-caption font-weight-medium d-flex"
        >
          <v-icon size="12" class="align-self-center">
            arrow_back_ios
          </v-icon>
          <div class="align-self-center font-weight-bold" @click="toHome">
            CANCEL
          </div>
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <img
            id="camera_button"
            src="~/assets/images/shoot.png"
            class="camera-shoot"
            @click="takePicture"
          >
        </v-col>
        <v-col
          id="library_button"
          cols="3"
          class="text-right align-self-center"
        >
          <v-btn icon density="comfortable" @click="selectImage">
            <v-icon size="18">
              photo_library
            </v-icon>
            <input
              id="file_selection"
              type="file"
              accept="image/*"
              class="camera_input"
              @change="fileInput"
            >
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <v-overlay
      :model-value="overlay"
      class="align-end custom-gradient rank-selection-overlay"
      :close-on-content-click="false"
      :close-on-back="false"
      persistent
    >
      <v-row dense class="h-100">
        <v-col v-for="(rank, index) in ranks" :key="index" cols="6">
          <v-btn
            block
            variant="outlined"
            class="text-white font-900 text-h5 h-100-important"
            size="large"
            :disabled="loading"
            @click="sendRank(rank)"
          >
            {{ rank }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col
          cols="12"
          class="text-center text-white text-uppercase text-caption mt-4 font-900"
        >
          <div @click="openDialog">
            Memo +
          </div>
        </v-col>
      </v-row>
    </v-overlay>
    <v-btn
      v-if="overlay"
      icon
      :disabled="loading"
      location="left bottom"
      position="absolute"
      class="back-button ma-4"
      color="white"
      density="compact"
      :style="{ width: '30px', height: '30px' }"
    >
      <v-icon size="16" class="ml-1" @click="overlay = false">
        arrow_back_ios
      </v-icon>
    </v-btn>
    <app-dialog>
      <v-row class="ma-4" dense>
        <v-col cols="12">
          <div class="text-16 font-900">
            MEMO
          </div>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="memo" />
        </v-col>
        <v-col cols="6">
          <v-btn
            color="greyButton"
            class="font-weight-bold"
            block
            @click="saveMemo('cancel')"
          >
            Cancel
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn
            color="primary"
            class="font-weight-bold"
            block
            @click="saveMemo('save')"
          >
            OK
          </v-btn>
        </v-col>
      </v-row>
    </app-dialog>
    <v-snackbar v-model="snackbar" color="success">
      ラベラーを作成しました。
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          閉じる
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
<script>
import { v4 as uuidv4 } from 'uuid'
import { mapState } from 'pinia'
import { useCameraStore } from '@/store/camera'
import { useGlobalStore } from '@/store/global'
import { getRanks, labelCreate } from '@/services/api'
export default {
  setup () {
    definePageMeta({
      middleware: ['auth']
    })
  },
  data () {
    return {
      stream: null,
      overlay: false,
      step: 1,
      ranks: [],
      rankName: '',
      memo: '',
      snackbar: false,
      loading: false
    }
  },
  computed: {
    ...mapState(useCameraStore, ['imageSource'])
  },
  mounted () {
    const currentRank = localStorage.getItem('selectedRank')
    if (!currentRank) {
      alert('Please select a rank')
      this.$router.push('/setting')
    } else {
      getRanks(Number(currentRank)).then((response) => {
        this.ranks = response.data.ranks
        this.rankName = response.data.rank_name
      })
    }
    this.showCamera()
    if (this.imageSource) {
      this.hideCamera()
      this.setCanvasImage()
    }
  },
  unmounted () {
    useCameraStore().$reset()
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      })
    }
  },
  methods: {
    reset () {
      const cameraButton = document.getElementById('camera_button')
      const cameraCircle = document.getElementById('camera_circle')
      const libraryButton = document.getElementById('library_button')
      const video = document.getElementById('video')
      const canvas = document.getElementById('canvas')
      const image = document.getElementById('canvas-image')
      cameraButton.style.display = 'block'
      cameraCircle.style.display = 'block'
      libraryButton.style.display = 'block'
      video.style.display = 'block'
      canvas.style.display = 'none'
      image.style.display = 'none'
      useCameraStore().$reset()
    },
    hideCamera () {
      const video = document.getElementById('video')
      const cameraButton = document.getElementById('camera_button')
      const cameraCircle = document.getElementById('camera_circle')
      const libraryButton = document.getElementById('library_button')
      video.style.display = 'none'
      cameraButton.style.display = 'none'
      cameraCircle.style.display = 'none'
      libraryButton.style.display = 'none'
    },
    showCamera () {
      this.reset()
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      const facingMode = 'environment' || 'user'

      const constraints = {
        audio: false,
        video: {
          facingMode,
          width: window.innerWidth,
          height: window.innerWidth * 1.333,
          aspectRatio: { ideal: 1.333 },
          focusMode: 'single-shot',
          exposureMode: 'single-shot'
        }
      }
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        this.stream = stream
        const video = document.getElementById('video')
        video.setAttribute('autoplay', '')
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.width = window.innerWidth
        video.height = window.innerWidth * 1.333
        video.srcObject = stream
      })
    },
    setCanvasImage () {
      const image = document.getElementById('canvas-image')
      image.style.display = 'block'
      image.src = this.imageSource
      this.overlay = true
    },
    fileInput (e) {
      const imageFile = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      reader.onload = (event) => {
        useCameraStore().$patch({
          imageSource: event.target.result
        })
        this.hideCamera()
        this.setCanvasImage()
        this.step = 2
      }
    },
    selectImage () {
      const input = document.getElementById('file_selection')
      input.click()
    },
    takePicture () {
      const video = document.getElementById('video')
      const canvas = document.getElementById('canvas')
      const preview = document.querySelector('.camera_circle_container')

      const sourceWidth = video.videoWidth
      const sourceHeight = video.videoHeight

      const previewWidth = preview.clientWidth
      const previewHeight = preview.clientHeight

      const sourceRatio = sourceWidth / sourceHeight
      const previewRatio = previewWidth / previewHeight

      let sx = 0
      let sy = 0
      let sWidth = sourceWidth
      let sHeight = sourceHeight

      // Preview дээр object-fit: cover ажиллаж байгаа crop-ийг тооцоолно
      if (sourceRatio > previewRatio) {
        // video илүү wide бол хоёр хажуу талаас crop хийнэ
        sWidth = sourceHeight * previewRatio
        sx = (sourceWidth - sWidth) / 2
      } else if (sourceRatio < previewRatio) {
        // video илүү өндөр бол дээр доороос crop хийнэ
        sHeight = sourceWidth / previewRatio
        sy = (sourceHeight - sHeight) / 2
      }

      canvas.width = sWidth
      canvas.height = sHeight

      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const imageData = canvas.toDataURL('image/jpeg', 0.92)

      useCameraStore().$patch({
        imageSource: imageData
      })

      this.hideCamera()
      this.setCanvasImage()
      this.step = 2
    },
    convertBase64ToFormData (base64Image, rank) {
      const byteCharacters = atob(base64Image.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const fileName = uuidv4()
      // add datetime to filename
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const formattedDate = `${year}${month}${day}_${hours}${minutes}${seconds}`
      const file = new File([byteArray], `${formattedDate}_${fileName}.jpg`, {
        type: 'image/jpeg'
      })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('rank', rank)
      formData.append('rank_name', this.rankName)
      formData.append('memo', this.memo ? this.memo : 'no memo')
      return formData
    },
    sendRank (rank) {
      this.loading = true
      labelCreate(this.convertBase64ToFormData(this.imageSource, rank)).then(
        () => {
          this.snackbar = true
          this.overlay = false
          setTimeout(() => {
            window.location.reload() // check if this is necessary
            this.loading = false
          }, 1000)
        }
      )
    },
    toHome () {
      if (this.step === 2) {
        this.step = 1
        this.showCamera()
      } else {
        this.$router.push('/top')
      }
    },
    openDialog () {
      useGlobalStore().$patch({
        dialog: {
          state: true
        }
      })
    },
    saveMemo (state) {
      if (state === 'cancel') {
        this.memo = ''
      }
      useGlobalStore().$patch({
        dialog: {
          state: false
        }
      })
    }
  }
}
</script>
