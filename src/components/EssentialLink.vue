<template>
  <q-item
    clickable
    tag="a"
    :href="link"
    :class="{ 'active': name === $route.name }"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: '#'
    },
    icon: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  }
})
</script>

<style lang="scss" scoped>
.q-item {
  &.active {
    background: $primary-light;
  }
}
</style>
