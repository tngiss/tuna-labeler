<template>
  <v-container fluid class="full-height bg-white">
    <v-row>
      <v-col cols="12" class="text-center">
        <img src="~/assets/images/logo.svg" class="fade-in-image">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  mounted () {
    setTimeout(() => {
      this.$router.push('/main')
    }, 3000)
  }
}
</script>
