<template>
  <div class="product-container">
    <h4 class="title">محصولات موجود</h4>
    <div class="swiper-container">
      <swiper :options="swiperOptions" :space-between="10" @swiper="onSwiper">
        <swiper-slide v-for="(slide, index) in slides" :key="index">
          <div class="card">
            <div class="pics">
              <div class="main-cover">
                <img
                  v-if="currentImage === 'main'"
                  src="~assets/images/sarve.png"
                  alt="Main Image"
                />
              </div>
            </div>
            <div class="desc">
              <h4>نام محصول: {{ slide.title }}</h4>
              <p>ویژگی های محصول: {{ slide.content }}</p>
              <p v-if="slide.age >= 18">
                رده سنی: <span class="warn">{{ slide.age }}+</span>
              </p>
              <p v-if="slide.age < 18">
                رده سنی: <span class="green">{{ slide.age }}+</span>
              </p>
              <p v-if="slide.rate >= 4">
                امتیاز کاربران: <span class="green">{{ slide.rate }}</span>
              </p>
              <p v-if="slide.rate < 4">
                امتیاز کاربران: <span class="week">{{ slide.rate }}</span>
              </p>
              <p>قیمت: {{ slide.price }} تومان</p>
            </div>
            <q-btn
              @click="deleteProduct(index)"
              color="negative"
              class="delete-product"
              >حذف محصول</q-btn
            >
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <div class="related-products">
      <q-btn @click="openModal" color="primary" class="s-btn"
        >افزودن محصول</q-btn
      >
    </div>
    <!-- add modal to add products -->
    <q-dialog v-model="isModalVisible">
      <q-card>
        <q-card-section>
          <q-input v-model="productName" label="نام محصول" />
          <q-input v-model="productDescription" label="توضیحات محصول" />
          <q-input v-model="ageSection" label="سن" /><q-input
            v-model="rateSection"
            label="امتیاز"
          />
          <q-input v-model="priceSection" label="قیمت" />
          <q-input v-model="Tag" label="تگ" />
        </q-card-section>
        <q-card-actions>
          <q-btn label="افزودن" color="primary" @click="addProduct" />
          <q-btn label="بستن" @click="closeModal" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useMeta } from "quasar";
import SwiperCore, { Navigation } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/vue";

// Import Swiper styles
import "swiper/swiper-bundle.css";

SwiperCore.use([Navigation]);

const metaData = {
  title: "معرفی محصولات",
};

export default defineComponent({
  name: "Products",
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    showModal: Boolean,
  },
  emits: ["add-product"],
  data() {
    return {
      currentImage: "main",
      isModalVisible: false, // Initialize modal visibility
      productName: "",
      productDescription: "",
      ageSection: "",
      rateSection: "",
      priceSection: "",
      Tag: "",
      slides: [
        {
          title: "محصول اول",
          content:
            " تستی تستی تستی تستی تستی تستی تستی تستی تستی تستی تستی تستی تستی تستتی تسیتس تیتس یتسیت سیت سیت این یک متن آزمایشی میباشد صرفا جهت تست کردنو پر کردن کانتینر ویژگی های محصول..",
          age: "16",
          rate: "4",
          price: "43000",
          section: "book",
          mainImgSrc: "~assets/images/sarve.png",
        },
        {
          title: "محصول دوم",
          content: "This is the content for Slide 2.",
          age: "17",
          rate: "3.2",
          price: "44000",
          section: "book",
          mainImgSrc: "~assets/images/sarve.png",
        },
        {
          title: "محصول سوم",
          content: "This is the content for Slide 2.",
          age: "18",
          rate: "4.7",
          price: "46000",
          section: "book",
          mainImgSrc: "~assets/images/sarve.png",
        },
        {
          title: "محصول چهارم",
          content: "This is the content for Slide 4.",
          age: "5",
          rate: "3.7",
          price: "460300",
          section: "book",
          mainImgSrc: "~assets/images/sarve.png",
        },
        // Add more slides as needed
      ],
    };
  },
  methods: {
    // Function to open the modal
    openModal() {
      this.isModalVisible = true;
    },
    // Function to close the modal
    closeModal() {
      this.isModalVisible = false;
    },
    // Function to add a product to the products array
    addProduct() {
      if (this.productName.trim() !== "") {
        this.slides.push({
          title: this.productName,
          content: this.productDescription,
          age: this.ageSection, // You can adjust these values as needed
          rate: this.rateSection, // You can adjust these values as needed
          price: this.priceSection, // You can adjust these values as needed
          section: this.Tag, // You can adjust these values as needed
          mainImgSrc: "~assets/images/sarve.png",
          relatedImg: ["~assets/images/sarve.png", "~assets/images/sarve.png"],
        });
        this.clearFields();
        this.closeModal();
      }
    },
    deleteProduct(index) {
      this.slides.splice(index, 1); // Remove the product at the specified index
    },
    clearFields() {
      this.productName = "";
      this.productDescription = "";
      this.ageSection = "";
      this.rateSection = "";
      this.priceSection = "";
      this.Tag = "";
    },
  },
  computed: {
   
  },
  setup() {
    useMeta(metaData);

    const swiperOptions = {
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    };

    const onSwiper = (swiper) => {
      console.log(swiper);
    };

    return {
      swiperOptions,
      onSwiper,
    };
  },
});
</script>

<style lang="scss" scoped>
.product-container {
  padding: 1rem;
  .title {
    font-size: 1.7rem;
    margin: 2rem 2rem;
  }
}
.related-products {
  width: 100%;
  .s-btn {
    width: 9.5%;
    margin-top: 2%;
    float: right;
    margin-right: 3.6%;
    height: fit-content;
    font-size: 0.85rem;
  }
}
.swiper-container {
  width: 100%;
  height: 100%;
}

.card {
  text-align: center;
  width: 95%;
  height: auto;
  padding: 1rem;
  display: flex;
  background-color: #fffdfd;
  flex-direction: row;
  margin: 0 auto;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border-bottom: 1px solid #d1d1d1;
  border-top: 1px solid #d1d1d1;
  .warn {
    color: red;
  }
  .week {
    color: orangered;
  }
  .green {
    color: green;
  }
  .pics {
    float: right;
    width: 20%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    .main-cover {
      width: 100%;
      height:230px;
      padding-top: 1rem;
      background-color: #ebeaea;
      border-radius: 10px;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
      margin-bottom: 0.2rem;
    }
  }
  .desc {
    margin-top: 0.5rem;
    margin-left: 1.5rem;
    // float: right;
    text-align: left;
    width: 100%;
    line-height: 1.5rem;
    font-size: 0.8rem;
    h4 {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
  }
  .delete-product {
    height: fit-content;
    font-size: 0.85rem;
    width: 12%;
    margin-top: 17%;
  }
}

/* Add navigation button styles if desired */
.swiper-button-prev,
.swiper-button-next {
  font-size: 24px;
  color: #007bff; /* Change color as needed */
}

/* Optional: Add responsive styles */
@media (max-width: 768px) {
  .card {
    width: 100%; /* Adjust card width for smaller screens */
    margin-right: 0;
    margin-bottom: 20px; /* Add spacing between cards on smaller screens */
  }
}
</style>
