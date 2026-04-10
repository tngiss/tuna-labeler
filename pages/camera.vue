<template>
  <v-container
    fluid
    class="camera_container pa-0 full-height d-flex flex-column overflow-hidden"
  >
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

    <!-- Overlay for rank selection -->
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

    <!-- Loading overlay when sending rank -->
    <v-overlay
      :model-value="loading"
      class="d-flex flex-column align-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.8); z-index: 9999; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh"
      persistent
      scrim="false"
    >
      <div class="d-flex flex-column align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="64" width="6" />
        <div class="mt-4 text-white text-h6 font-weight-bold">
          Sending...
        </div>
      </div>
    </v-overlay>
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
  async mounted () {
    const currentRank = localStorage.getItem('selectedRank')
    if (!currentRank) {
      alert('Please select a rank')
      this.$router.push('/setting')
      return
    }

    const response = await getRanks(Number(currentRank))
    this.ranks = response.data.ranks
    this.rankName = response.data.rank_name

    if (this.imageSource) {
      this.hideCamera()
      this.setCanvasImage()
    } else {
      this.showCamera()
    }
  },
  unmounted () {
    useCameraStore().$reset()
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
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
    async showCamera () {
      this.reset()

      const preview = document.querySelector('.camera_circle_container')
      const previewWidth = preview ? preview.clientWidth : window.innerWidth
      const previewHeight = preview
        ? preview.clientHeight
        : window.innerHeight - 144
      const previewRatio = previewWidth / previewHeight

      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          aspectRatio: { ideal: previewRatio },
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          frameRate: { ideal: 30 }
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.stream = stream

        const video = document.getElementById('video')
        video.setAttribute('autoplay', '')
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.srcObject = stream

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play()
            resolve()
          }
        })
      } catch (err) {
        console.error('Error initializing camera:', err)
      }
    },
    async takePicture () {
      const video = document.getElementById('video')
      if (!video || !video.videoWidth) {
        console.error('Video not ready')
        return
      }

      // Actual video stream dimensions
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      const videoRatio = videoWidth / videoHeight

      // Display container dimensions (visible in CSS)
      const displayWidth = video.clientWidth
      const displayHeight = video.clientHeight
      const displayRatio = displayWidth / displayHeight

      // Crop like object-fit: cover
      let sx = 0
      let sy = 0
      let sWidth = videoWidth
      let sHeight = videoHeight

      if (videoRatio > displayRatio) {
        // Video is wider → sides will be cropped
        sWidth = videoHeight * displayRatio
        sx = (videoWidth - sWidth) / 2
      } else {
        // Video is taller → top and bottom will be cropped
        sHeight = videoWidth / displayRatio
        sy = (videoHeight - sHeight) / 2
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true
      })

      canvas.width = sWidth
      canvas.height = sHeight

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Crop and capture only the visible portion
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)

      canvas.toBlob(
        (blob) => {
          this.handleBlob(blob)
        },
        'image/jpeg',
        1.0
      )
    },
    async handleBlob (blob) {
      const img = await createImageBitmap(blob)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      let ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true
      })
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0)

      // Check file size and compress
      let quality = 1.0
      let base64data = canvas.toDataURL('image/jpeg', quality)
      let currentSize = Math.round((base64data.length * 3) / 4)

      // Reduce quality
      while (currentSize > MAX_FILE_SIZE && quality > 0.85) {
        quality -= 0.03
        base64data = canvas.toDataURL('image/jpeg', quality)
        currentSize = Math.round((base64data.length * 3) / 4)
      }

      // Reduce resolution
      if (currentSize > MAX_FILE_SIZE) {
        const scale = Math.sqrt(MAX_FILE_SIZE / currentSize)
        const targetWidth = Math.floor(img.width * scale)
        const targetHeight = Math.floor(img.height * scale)

        const resizedCanvas = document.createElement('canvas')
        resizedCanvas.width = targetWidth
        resizedCanvas.height = targetHeight

        const resizedCtx = resizedCanvas.getContext('2d', {
          alpha: false,
          desynchronized: true
        })
        resizedCtx.imageSmoothingEnabled = true
        resizedCtx.imageSmoothingQuality = 'high'

        resizedCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight)
        base64data = resizedCanvas.toDataURL('image/jpeg', 0.98)
      }

      useCameraStore().$patch({ imageSource: base64data })
      this.hideCamera()
      this.setCanvasImage()
      this.step = 2
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
    setCanvasImage () {
      const image = document.getElementById('canvas-image')
      image.style.display = 'block'
      image.src = this.imageSource
      this.overlay = true
    },
    convertBase64ToFormData (base64Image, rank) {
      const byteCharacters = atob(base64Image.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const fileName = uuidv4()
      const now = new Date()
      const formattedDate = `${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(
        now.getHours()
      ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(
        now.getSeconds()
      ).padStart(2, '0')}`
      const file = new File([byteArray], `${formattedDate}_${fileName}.jpg`, {
        type: 'image/jpeg'
      })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('rank', rank)
      formData.append('rank_name', this.rankName)
      formData.append('memo', this.memo || 'no memo')
      return formData
    },
    sendRank (rank) {
      this.loading = true
      labelCreate(this.convertBase64ToFormData(this.imageSource, rank))
        .then(() => {
          this.snackbar = true
          this.overlay = false
          setTimeout(() => {
            this.loading = false
            window.location.reload()
          }, 1000)
        })
        .catch((error) => {
          console.error('Label creation failed:', error)
          this.loading = false
          alert('Failed to create label. Please try again.')
        })
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
        dialog: { state: true }
      })
    },
    saveMemo (state) {
      if (state === 'cancel') {
        this.memo = ''
      }
      useGlobalStore().$patch({
        dialog: { state: false }
      })
    }
  }
}
</script>
