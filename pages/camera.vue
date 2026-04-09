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

    <!-- Camera warm-up overlay -->
    <v-overlay
      v-if="isWarmingUp"
      absolute
      class="d-flex flex-column align-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.7); z-index: 9999"
    >
      <v-progress-circular indeterminate color="white" size="48" />
      <div class="mt-4 text-white text-h6 font-weight-bold">
        Preparing camera...
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
      imageCapture: null,
      overlay: false,
      step: 1,
      ranks: [],
      rankName: '',
      memo: '',
      snackbar: false,
      loading: false,
      isWarmingUp: false
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
      this.isWarmingUp = true

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
          aspectRatio: { ideal: previewRatio }
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

        const track = stream.getVideoTracks()[0]
        this.imageCapture = new ImageCapture(track)

        try {
          const capabilities = await this.imageCapture.getPhotoCapabilities()
          const warmupSettings = {}
          if (capabilities.imageWidth?.max) {
            warmupSettings.imageWidth = capabilities.imageWidth.max
          }
          if (capabilities.imageHeight?.max) {
            warmupSettings.imageHeight = capabilities.imageHeight.max
          }
          await this.imageCapture.takePhoto(warmupSettings)
        } catch (warmErr) {
          console.warn('Warm-up failed, fallback to grabFrame():', warmErr)
          try {
            await this.imageCapture.grabFrame()
          } catch (grabErr) {
            console.warn('grabFrame() also failed:', grabErr)
          }
        }
      } catch (err) {
        console.error('Error initializing camera:', err)
      } finally {
        this.isWarmingUp = false
      }
    },
    async takePicture () {
      if (!this.imageCapture) {
        console.error('ImageCapture not initialized')
        return
      }

      try {
        const capabilities = await this.imageCapture.getPhotoCapabilities()
        const photoSettings = {}
        if (capabilities.imageWidth?.max) {
          photoSettings.imageWidth = capabilities.imageWidth.max
        }
        if (capabilities.imageHeight?.max) {
          photoSettings.imageHeight = capabilities.imageHeight.max
        }

        const blob = await this.imageCapture.takePhoto(photoSettings)
        this.handleBlob(blob)
      } catch (error) {
        console.warn('takePhoto() failed, fallback to grabFrame():', error)
        try {
          const bitmap = await this.imageCapture.grabFrame()
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(bitmap, 0, 0)
          canvas.toBlob(
            (blob) => {
              this.handleBlob(blob)
            },
            'image/jpeg',
            1.0
          )
        } catch (grabErr) {
          console.error('grabFrame() also failed:', grabErr)
        }
      }
    },
    async handleBlob (blob) {
      const img = await createImageBitmap(blob)
      const video = document.getElementById('video')
      const videoRatio = video.videoWidth / video.videoHeight
      const targetHeight = img.height
      const targetWidth = targetHeight * videoRatio

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')

      const inputRatio = img.width / img.height
      let sx = 0
      let sy = 0
      let sWidth = img.width
      let sHeight = img.height
      if (inputRatio > videoRatio) {
        sWidth = img.height * videoRatio
        sx = (img.width - sWidth) / 2
      } else {
        sHeight = img.width / videoRatio
        sy = (img.height - sHeight) / 2
      }

      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        targetWidth,
        targetHeight
      )
      const base64data = canvas.toDataURL('image/jpeg', 1.0)
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
      labelCreate(this.convertBase64ToFormData(this.imageSource, rank)).then(
        () => {
          this.snackbar = true
          this.overlay = false
          setTimeout(() => {
            window.location.reload()
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
