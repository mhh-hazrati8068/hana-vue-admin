<template>
  <div id="chart">
    <apexchart
      type="area"
      height="250"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>
<script>
export default {
  name: "WeeklyChart",
  data() {
    return {
      series: [
        {
          name: "Desktops",
          data: [10, 41, 35, 51, 49, 62, 69],
        },
      ],
      chartOptions: {
        chart: {
          height: 250,
          type: "area",
          zoom: {
            enabled: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        title: {
          // text: "Product Trends by Month",
          align: "left",
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: ["Sat", "Sun", "Mon", "Tus", "Wed", "Thu", "Fri"],
        },
      },
    };
  },
};
</script>
