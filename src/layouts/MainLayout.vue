<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header class="flex flex-center q-mb-md">
          <img src="~assets/images/fargo.svg" class="logo" />
        </q-item-label>
        <q-expansion-item
          :expand-icon="item.children !== undefined ? '' : '_'"
          v-for="item in essentialLinks"
          :key="item.title"
          :label="item.title"
          group="sidebar-links"
          :disable="!item.active"
        >
          <q-expansion-item
            :expand-icon="'_'"
            v-for="subitem in item.children"
            :key="subitem.name + Math.random()"
            :label="subitem.title"
            :to="subitem.link"
            :header-inset-level="1"
            exact
            :disable="!subitem.active"
          >
          </q-expansion-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
const linksList = [
  {
    title: "تست\u200Cهای روانشناسی",
    icon: "",
    name: "psychologyTests",
    active: true,
    children: [
      {
        title: "دسته\u200Cبندی\u200Cها",
        icon: "",
        link: "/category",
        name: "category",
        active: true,
      },
      {
        title: "تگ\u200Cها",
        icon: "",
        link: "/tags",
        name: "tags",
        active: true,
      },
      {
        title: "تست\u200Cها",
        icon: "quiz",
        link: "/tests",
        name: "tests",
        active: true,
      },
      {
        title: "سوال\u200Cها",
        icon: "question_mark",
        link: "/questions",
        name: "questions",
        active: true,
      },
      {
        title: "پاسخ\u200Cها",
        icon: "rule",
        link: "/answers",
        name: "answers",
        active: true,
      },
      {
        title: "تحلیل\u200Cها",
        icon: "auto_graph",
        link: "/analysis",
        name: "analysis",
        active: true,
      },
      /*{
        title: 'دیدگاه\u200Cها',
        icon: '',
        link: '/comments',
        name: 'comments'
      }*/
    ],
  },
  {
    title: "تست وکسلر",
    icon: "",
    name: "wiscTest",
    active: true,
    children: [
      {
        title: "سوال\u200Cها",
        icon: "quiz",
        link: "/wisc-questions",
        name: "wiscQuestions",
        active: false,
      },
      {
        title: "پاسخ\u200Cها",
        icon: "rule",
        link: "/wisc-answers",
        name: "wiscAnswers",
        active: false,
      },
    ],
  },
  {
    title: "تاجر ایرانی",
    icon: "",
    name: "iranianMerchant",
    active: true,
    children: [
      {
        title: "کشورها",
        icon: "flag",
        link: "/countries",
        name: "countries",
        active: false,
      },
      {
        title: "استان\u200Cها",
        link: "/states",
        name: "states",
        active: false,
      },
    ],
  },
  {
    title: "ثبت حال",
    link: "/set-mood",
    name: "mood",
    active: false,
  },
];
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  methods: {
    getDrawerItemLink(item) {
      if (item.name === undefined) {
        return undefined;
      }
      const route = { name: item.name };
      if (item.query !== undefined) {
        route.query = item.query;
      }
      return route;
    },
  },
});
</script>

<style lang="scss" scoped>
.q-header {
  background: $white;
  color: $dark;
}
</style>
