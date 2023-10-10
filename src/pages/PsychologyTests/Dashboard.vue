<template>
  <div class="test-categories-container">
    <div class="box-container">
      <div class="box">
        <q-btn flat dense round icon="cached" aria-label="cached" class="btn" />
        <!-- <p>23 آنلاین</p> -->
        <p>تعداد کاربران</p>
      </div>
      <div class="box box2">
        <q-btn flat dense round icon="cached" aria-label="cached" class="btn" />
        <!-- <p>23 کالا</p> -->
        <p>کالاهای تعریف</p>
      </div>
      <div class="box">
        <q-btn flat dense round icon="cached" aria-label="cached" class="btn" />
        <!-- <p>آنلاین</p> static -->
        <p>ادمین</p>
      </div>
    </div>

    <div class="charts-container">
      <div class="weekly"><WeeklyChart></WeeklyChart></div>
      <div class="monthly"><MonthlyChart></MonthlyChart></div>
    </div>
    <div class="total"><TotalChart></TotalChart></div>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";
import vars from "../../vars";
import * as axios from "axios";
import { useMeta } from "quasar";

const metaData = {
  title: "داشبورد",
};

const MonthlyChart = defineAsyncComponent(() =>
  import("components/charts/MonthlyChart.vue")
);
const WeeklyChart = defineAsyncComponent(() =>
  import("components/charts/WeeklyChart.vue")
);
const TotalChart = defineAsyncComponent(() =>
  import("components/charts/TotalChart.vue")
);

export default defineComponent({
  name: "Dashboard",
  setup() {
    useMeta(metaData);
  },
  components: {
    MonthlyChart,
    WeeklyChart,
    TotalChart,
  },
});
</script>

<style lang="scss" scoped>
.test-categories-container {
  padding: 0 1rem;
  .box-container {
    display: flex;
    justify-content: space-between;
  }

  .box {
    width: 50%;
    height: 100px;
    background-color: #ffe7db;
    text-align: center;
    line-height: 100px;
    border-radius: 20px;
    padding: 0.5rem;
    margin: 5px;

    p {
      height: 10%;
    }
    .btn {
      color: #c1c1c1;
      position: relative;
      top: 0;
      float: left;
    }
  }

  .box2 {
    background-color: rgba(191, 213, 174, 0.42);
  }

  .title {
    font-size: 1.1rem;
    margin-top: 1rem;
  }

  .charts-container {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem;
    .monthly {
      width: 50%;
      height: 260px;
      background-color: #ffe7db;
      border-radius: 20px;
      margin-left: 5px;
    }
    .weekly {
      width: 50%;
      height: 260px;
      background-color: #bfd5ae;
      border-radius: 20px;
      margin-right: 5px;
    }
  }
  .total {
    margin: 0 auto;
    position: relative;
    top: 0.5rem;
    border-radius: 20px;
    width: 99.5%;
    height: 380px;
    background-color: #edebeb;
  }
  .categories-wrapper {
    margin-top: 2rem;
  }
}
</style>
