<template>
  <div class="countries-wrapper">
    <q-input
      v-model="search"
      outlined
      dense
      placeholder="جستجو کنید..."
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="existing-countries">
      <div class="row">
        <div class="col-12">
          <span class="title">کشورهای ثبت شده</span>
        </div>
        <div class="col-12">
          <q-table
            :columns="columns"
            :rows="countries"
            v-model:pagination="pagination"
            :loading="loading"
            class="q-mt-lg"
          />
        </div>
        <div class="col-12 flex justify-end">
          <q-btn
            unelevated
            dense
            label="افزودن کشور"
            icon-right="add"
            color="primary"
            class="btn q-mt-md"
            @click="createDialog = !createDialog"
          />
        </div>
      </div>
    </div>
  </div>
  <q-dialog v-model="createDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">افزودن کشور</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">نام</span>
              <q-input
                outlined
                dense
                v-model="countryData.name"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">پایتخت</span>
              <q-input
                outlined
                dense
                v-model="countryData.capital"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">زبان</span>
              <q-input
                outlined
                dense
                v-model="countryData.language"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">واحد پول</span>
              <q-input
                outlined
                dense
                v-model="countryData.currency"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">جمعیت</span>
              <q-input
                outlined
                dense
                v-model="countryData.population"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">کد سه حرفی</span>
              <q-input
                outlined
                dense
                v-model="countryData.iso3"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">کد</span>
              <q-input
                outlined
                dense
                v-model="countryData.countryCode"
                type="number"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">فایل تصویری</span>
              <q-file
                outlined
                dense
                v-model="countryData.picture"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">فایل سرود ملی</span>
              <q-file
                outlined
                dense
                v-model="countryData.nationalAnthem"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">صادرات</span>
              <q-input
                outlined
                dense
                v-model="countryData.exportation"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">واردات</span>
              <q-input
                outlined
                dense
                v-model="countryData.importation"
              />
            </div>
          </div>
          <div class="col-12">
            <q-btn
              unelevated
              dense
              label="ثبت کشور"
              color="primary"
              class="submit-btn"
              @click="setCountry"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: 'Countries',
  data() {
    return {
      search: '',
      columns: [],
      countries: [],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      loading: false,
      createDialog: false,
      countryData: {
        countryCode: null,
        iso3: '',
        name: '',
        currency: '',
        capital: '',
        language: '',
        population: '',
        exportation: [],
        importation: [],
        picture: '',
        nationalAnthem: ''
      }
    }
  },
  methods: {
    setCountry() {}
  }
})
</script>

<style lang="scss" scoped>
.countries-wrapper {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    display: inline-block;
    margin-top: 1rem;
  }
}
</style>
