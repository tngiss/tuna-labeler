<template>
  <div class="custom-app-bar">
    <v-row dense>
      <v-col cols="3" class="align-self-center">
        <v-btn
          icon
          flat
          :ripple="false"
          to="/top"
          color="transparent"
          class="ml-2"
        >
          <v-icon>home</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6" class="align-self-center">
        <div class="text-center font-weight-bold">
          {{ title }}
        </div>
      </v-col>
      <v-col v-if="deleteState" cols="3" class="align-self-center text-right">
        <v-btn
          flat
          :ripple="false"
          color="transparent"
          variable="text"
          class="mr-2 text-caption font-weight-bold"
          @click="$emit('delete')"
        >
          DELETE
        </v-btn>
      </v-col>
      <v-col v-if="add" cols="3" class="align-self-center text-right">
        <v-btn
          flat
          :ripple="false"
          color="transparent"
          variable="text"
          class="mr-2 text-caption font-weight-bold"
          @click="$emit('add'), (addStatus = true)"
        >
          NEW +
        </v-btn>
      </v-col>
      <v-col v-if="edit" cols="3" class="align-self-center text-right">
        <v-btn
          v-if="!editStatus"
          flat
          :ripple="false"
          color="transparent"
          variable="text"
          class="mr-2 text-caption font-weight-bold"
          @click="$emit('edit'), (editStatus = true)"
        >
          EDIT
        </v-btn>
        <v-btn
          v-if="editStatus"
          flat
          :ripple="false"
          color="transparent"
          variable="text"
          class="mr-2 text-caption font-weight-bold"
          @click="$emit('cancel'), (editStatus = false)"
        >
          CANCEL
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Home'
    },
    edit: {
      type: Boolean,
      default: false
    },
    add: {
      type: Boolean,
      default: false
    },
    deleteState: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'cancel', 'add', 'delete'],
  data () {
    return {
      editStatus: false,
      addStatus: false
    }
  }
}
</script>
