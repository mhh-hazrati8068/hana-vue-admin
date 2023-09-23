<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header-container">
      <q-toolbar class="header-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
      <div class="q-card-container header-section">
        <p>سیستم مدیریت یکپارچه شرکت سروهانا پارسیان</p>
      </div>

    </q-header>
    <q-item-label>
      <img src="~assets/images/label.svg" alt="label" class="label" />
    </q-item-label>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header class="flex flex-center q-mb">
          <img src="~assets/images/headerLogo.svg" class="logo" />
        </q-item-label>
        <div class="list-container">
          <q-expansion-item
            :expand-icon="item.children !== undefined ? '' : '_'"
            v-for="item in essentialLinks"
            :key="item.title"
            :label="item.title"
            :to="item.link"
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
        </div>
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
    title: "داشبورد",
    icon: "",
    name: "psychologyTests",
    active: true,
    link: "/Dashboard",
  },
  {
    title: "تست ها ",
    icon: "",
    name: "wiscTest",
    active: true,
    children: [
      {
        title: "ورود تست",
        icon: "quiz",
        link: "/wisc-questions",
        name: "wiscQuestions",
        active: true,
      },
      {
        title: "گزارش های درخواستی",
        icon: "rule",
        link: "/wisc-answers",
        name: "wiscAnswers",
        active: true,
      },
    ],
  },
  {
    title: "فروشگاه",
    icon: "",
    name: "iranianMerchant",
    active: true,
    children: [
      {
        title: "معرفی محصولات",
        icon: "flag",
        link: "/countries",
        name: "countries",
        active: true,
      },
      {
        title: "محصولات فروخته شده",
        link: "/states",
        name: "states",
        active: true,
      },
      {
        title: "آپلود گزارش کاربر",
        link: "/states",
        name: "states",
        active: false,
      },
    ],
  },
  {
    title: "ساخت بازی",
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
.q-card-container {
  width: 100%;
  max-height: 50px;
}
.header-toolbar {
  flex: 1;
}
.q-card-container p {
  width: 100%;
  margin: 0 auto;
  color: $white;
  text-align: center;
  font-size: 12px;
  font-weight: bolder;
}

.header {
  margin-top: 10px;
}
.logo {
  width: 200px;
  height: auto;
}

.label {
  margin-top: 50px;
  opacity: 0.7;
  position: relative;
  z-index: 2;
}
.list-container {
  margin: 0 auto;
  padding: 2%;
  width: 227px;
  height: 650px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #ffb8b8;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}
</style>
