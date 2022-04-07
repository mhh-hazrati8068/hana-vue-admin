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
            @request="getCountries"
            class="q-mt-lg"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.value }}
                  <q-btn
                    v-if="col.field === 'detail'"
                    unelevated
                    dense
                    round
                    icon="visibility"
                    class="detail-btn"
                  />
                  <q-btn
                    v-if="col.field === 'edit'"
                    unelevated
                    dense
                    round
                    icon="edit"
                    class="edit-btn"
                  />
                  <q-btn
                    v-if="col.field === 'delete'"
                    unelevated
                    dense
                    round
                    icon="delete"
                    class="delete-btn"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
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
                maxlength="3"
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
              <span class="label">صادرات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="countryData.exportation"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">واردات (هریک از موارد را با \ جدا کنید)</span>
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
            >
              <q-inner-loading
                :showing="isLoading"
              />
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import * as axios from "axios";
import vars from '../../vars';

export default defineComponent({
  name: 'Countries',
  data() {
    return {
      search: '',
      columns: [
        { name: 'countryCode', align: 'center', label: 'کد', field: 'countryCode'},
        { name: 'iso3', align: 'center', label: 'کد سه حرفی', field: 'iso3'},
        { name: 'name', align: 'center', label: 'نام کشور', field: 'name'},
        { name: 'capital', align: 'center', label: 'پایتخت', field: 'capital'},
        { name: 'detail', align: 'center', label: '', field: 'detail'},
        { name: 'edit', align: 'center', label: '', field: 'edit'},
        { name: 'delete', align: 'center', label: '', field: 'delete'},
      ],
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
      },
      isLoading: false,
      qBody: {
        take: 20,
        skip: 0
      },
    }
  },
  methods: {
    setCountry() {
      this.isLoading = true
      let isCountryCodeReiterative = false;
      let isIso3Reiterative = false;
      let importation = []
      let exportation = []
      importation = this.countryData.importation.split('\\')
      exportation = this.countryData.exportation.split('\\')
      let fd = new FormData()
      if (!this.countryData.capital || !this.countryData.countryCode || !this.countryData.currency || !this.countryData.iso3 || !this.countryData.name ||
          !this.countryData.language || !this.countryData.population || !this.countryData.importation || !this.countryData.exportation ||
          !this.countryData.picture || !this.countryData.nationalAnthem) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.isLoading = false
      } else {
        fd.append("capital", this.countryData.capital)
        fd.append("countryCode", this.countryData.countryCode)
        fd.append("currency", this.countryData.currency)
        fd.append("iso3", this.countryData.iso3)
        fd.append("name", this.countryData.name)
        fd.append("language", this.countryData.language)
        fd.append("population", this.countryData.population)
        fd.append("importation", JSON.stringify(importation))
        fd.append("export", JSON.stringify(exportation))
        fd.append("picture", this.countryData.picture)
        fd.append("nationalAnthem", this.countryData.nationalAnthem)

        for (let i = 0; i < this.countries.length; i++) {
          if (this.countries[i].countryCode === Number(this.countryData.countryCode)) {
            console.log(this.countries[i].countryCode)
            isCountryCodeReiterative = true;
          }
          if (this.countries[i].iso3 === Number(this.countryData.iso3)) {
            isIso3Reiterative = true;
          }
        }
        if (isCountryCodeReiterative || isIso3Reiterative) {
          this.$q.notify({
            type: 'negative',
            message: 'کد کشور و یا کد سه حرفی تکراری میباشد.'
          })
          this.isLoading = false
        } else if (this.countryData.picture.type !== 'image/png') {
          this.$q.notify({
            type: 'negative',
            message: 'نوع فایل تصویری باید بصورت png باشد.'
          })
          this.isLoading = false
        } else if (this.countryData.nationalAnthem.type !== 'audio/mpeg') {
          this.$q.notify({
            type: 'negative',
            message: 'نوع فایل صوتی باید بصورت mp3 باشد.'
          })
          this.isLoading = false
        } else {
          axios.post(vars.api_base3 + '/Country/CreateCountry', fd).then(response => {
            if (response.data.isSuccess) {
              this.$q.notify({
                type: 'positive',
                message: 'اطلاعات کشور با موفقیت ثبت شد.'
              })
              this.countryData = {
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
              this.createDialog = false
              this.isLoading = false
            }
          }).catch(error => {
            console.log(error)
            this.$q.notify({
              type: 'negative',
              message: 'مشکلی پیش آمد.'
            })
            this.isLoading = false
          })
        }
      }
    },
    getCountries(reqProps) {
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base3 + '/Country/GetCountry', {
        searchQuery: null,
        countryCode: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
        fromDateTime: null,
        toDateTime: null
      }).then(response => {
        this.pagination.rowsNumber = response.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        this.countries = response.data.items
      }).catch(error =>{
        console.log(error)
      })
    }
  },
  created() {
    this.getCountries()
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
