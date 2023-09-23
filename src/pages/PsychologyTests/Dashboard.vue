<template>
  <div class="test-categories-container">
    <div class="box-container">
      <div class="box">Box 1</div>
      <div class="box">Box 2</div>
      <div class="box">Box 3</div>
    </div>

    <div class="charts-container">
      <div class="monthly"><MonthlyChart></MonthlyChart></div>
      <div class="weekly"><WeeklyChart></WeeklyChart></div>
    </div>
    <div class="total"></div>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";
import vars from "../../vars";
import * as axios from "axios";
import { useMeta } from "quasar";

const MonthlyChart = defineAsyncComponent(() =>
  import("components/charts/MonthlyChart.vue")
);
const WeeklyChart = defineAsyncComponent(() =>
  import("components/charts/WeeklyChart.vue")
);

export default defineComponent({
  name: "Dashboard",
  components: {
    MonthlyChart,
    WeeklyChart,
  },
});
</script>

<style lang="scss" scoped>
.test-categories-container {
  padding:0 1rem;
  .box-container {
    display: flex; /* Use flexbox */
    justify-content: space-between; /* Distribute space between items */
  }

  .box {
    width: 50%; /* Set a fixed width for each box (adjust as needed) */
    height: 100px; /* Set a fixed height for each box (adjust as needed) */
    background-color: #e0e0e0;
    text-align: center;
    line-height: 100px;
    border-radius: 20px;
    padding: 0.5rem;
    margin: 5px; /* Add some margin between boxes */
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
      padding: 0.25rem;
      height: 260px;
      background-color: #ffe7db;
      border-radius: 20px;
      margin-right: 5px;
    }
    .weekly {
      width: 50%;
      height: 260px;
      background-color: #bfd5ae;
      margin-left: 5px;
      border-radius: 20px;
    }
  }
  .total {
    margin:0 auto;
    position: relative;
    top: 0.5rem;
    border-radius: 20px;
    width: 99.5%;
    height: 400px;
    background-color: #dadada;
  }
  .categories-wrapper {
    margin-top: 2rem;
  }
}
</style>
