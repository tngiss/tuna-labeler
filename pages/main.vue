<template>
  <v-container fluid class="entry-bg full-height">
    <v-form ref="form" v-model="valid">
      <v-row dense class="z-content">
        <v-col cols="10" offset="1">
          <div class="text-uppercase text-white font-weight-medium text-16">
            Please login to continue
          </div>
        </v-col>
        <v-col v-if="error" cols="10" offset="1">
          <v-alert color="error">
            <div class="text-caption text-white">
              Invalid email or password
            </div>
          </v-alert>
        </v-col>
        <v-col cols="10" offset="1">
          <v-text-field
            v-model="email"
            :rules="rules.requiredRule"
            placeholder="Email address"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="white-bg-button"
          />
        </v-col>
        <v-col cols="10" offset="1">
          <v-text-field
            v-model="password"
            :rules="rules.requiredRule"
            placeholder="Password"
            type="password"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="white-bg-button"
          />
        </v-col>
        <v-col cols="10" offset="1" class="text-center mt-4">
          <v-btn
            color="pink-accent-2 font-weight-bold h-60 w-122px"
            size="x-large"
            :loading="loading"
            @click="auth"
          >
            OK
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { useGlobalStore } from '@/store/global'
import { login } from '@/services/api'
import { rules } from '@/static/rules'
export default {
  data () {
    return {
      rules,
      valid: false,
      email: '',
      password: '',
      loading: false,
      error: false
    }
  },
  methods: {
    auth () {
      if (!this.valid) {
        this.$refs.form.validate()
        return
      }
      this.loading = true
      this.error = false
      login({
        email: this.email.toLocaleLowerCase(),
        password: this.password
      })
        .then((response) => {
          useGlobalStore().$patch({
            auth: {
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token
            }
          })
          localStorage.setItem('accessToken', response.data.access_token)
          localStorage.setItem('refreshToken', response.data.refresh_token)
          this.loading = false
          window.location = '/top'
        })
        .catch(() => {
          this.error = true
          this.loading = false
        })
    }
  }
}
</script>
