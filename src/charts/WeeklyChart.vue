<template>
    <div>
      <q-card>
        <q-card-section>
          <canvas ref="lineChartCanvas"></canvas>
        </q-card-section>
      </q-card>
    </div>
  </template>
  
  <script>
  import { Line, mixins } from "vue-chartjs";
  
  export default {
    extends: Line,
    mixins: [mixins.reactiveData],
    props: {
      chartData: {
        type: Object,
        required: true,
      },
      chartOptions: {
        type: Object,
        default: () => ({}),
      },
    },
    methods: {
      updateChart() {
        this.renderChart(this.chartData, this.chartOptions);
      },
    },
    mounted() {
      this.renderChart(this.chartData, this.chartOptions);
    },
  };
  </script>
  
  <style lang="scss" scoped>
  /* Your CSS styles here */
  </style>
  