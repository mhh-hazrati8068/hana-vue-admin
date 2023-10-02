<template>
  <div id="chart">
    <apexchart
      type="bar"
      height="350"
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
          name: "نوع اول",
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
        },
        {
          name: "نوع دوم",
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
        },
        {
          name: "نوع سوم",
          data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
        },
        {
          name: "نوع چهارم",
          data: [35, 41, 22, 26, 45, 48, 55, 53, 41],
        },
        {
          name: "نوع پنجم",
          data: [35, 41, 36, 22, 45, 48, 52, 55, 41],
        },{
          name: "نوع ششم",
          data: [35, 41, 36, 26, 22, 48, 52, 53, 55],
        },{
          name: "نوع هفتم",
          data: [35, 41, 36, 55, 45, 22, 52, 53, 41],
        },
      ],
      chartOptions: {
        chart: {
          type: "bar",
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            endingShape: "rounded",
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["transparent"],
        },
        xaxis: {
          categories: [
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
          ],
        },
        yaxis: {
          title: {
            text: "(tomans)",
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " tomans";
            },
          },
        },
      },
    };
  },
};
</script>
