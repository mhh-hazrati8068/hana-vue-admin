<template>
  <div class="test-categories-container"></div>
</template>

<script>
import { defineComponent } from "vue";
import vars from "../../vars";
import * as axios from "axios";
import { useMeta } from "quasar";



export default defineComponent({
  name: "Dashboard",
})
</script>

<style lang="scss" scoped>
.test-categories-container {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    margin-top: 2rem;
  }

  .categories-wrapper {
    margin-top: 2rem;
  }
}
</style>
