<template>
  <v-dialog v-model="dialogState" persistent>
    <v-card>
      <slot />
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'pinia'
import { useGlobalStore } from '@/store/global'
export default {
  computed: {
    ...mapState(useGlobalStore, ['dialog']),
    dialogState: {
      get () {
        return this.dialog.state
      },
      set (value) {
        useGlobalStore().$patch({
          dialog: {
            state: value
          }
        })
      }
    }
  }
}
</script>
