<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script>
import NProgress from 'nprogress'
import { useGlobalStore } from '@/store/global'
export default {
  mounted () {
    // loader
    const router = useRouter()
    NProgress.configure({
      showSpinner: false
    })
    router.beforeEach(() => {
      NProgress.start()
    })
    router.afterEach(() => {
      NProgress.done()
    })
    useGlobalStore().$subscribe((_mutation, state) => {
      if (state.alerts.length) {
        setTimeout(() => {
          state.alerts.shift()
        }, 10000)
      }
    })
  }
}
</script>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.25s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: grayscale(1);
}
</style>
