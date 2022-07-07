<template>
  <q-page>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  mounted() {
    if (this.$route.query.t) {
      const token = this.$route.query.t;
      console.log(token)
      localStorage.setItem('token', token);
      this.$router.push('category');
    }
  }
})
</script>
