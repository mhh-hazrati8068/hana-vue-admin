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
                    title="جزئیات"
                    @click="openDetailDialog(props.row)"
                  />
                  <q-btn
                    v-if="col.field === 'edit'"
                    unelevated
                    dense
                    round
                    icon="edit"
                    class="edit-btn"
                    title="ویرایش"
                    @click="openEditDialog(props.row)"
                  />
                  <q-btn
                    v-if="col.field === 'delete'"
                    unelevated
                    dense
                    round
                    icon="delete"
                    class="delete-btn"
                    title="حذف"
                    @click="deleteCountry(props.row.id)"
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
  <q-dialog v-model="detailDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">جزئیات کشور</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              کد: {{ selectedCountryToShow.countryCode }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              کد سه حرفی: {{ selectedCountryToShow.iso3 }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              نام: {{ selectedCountryToShow.name }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              پایتخت: {{ selectedCountryToShow.capital }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              زبان: {{ selectedCountryToShow.language }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              جمعیت: {{ selectedCountryToShow.population }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              واحد پول: {{ selectedCountryToShow.currency }}
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              صادرات:
              <span v-for="(item, index) of selectedCountryToShow.export" :key="index">
                {{ item }} <span v-if="index !== selectedCountryToShow.export.length - 1 && selectedCountryToShow.export.length !== 1"> ,</span>
              </span>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              واردات:
              <span v-for="(item, index) of selectedCountryToShow.importation" :key="index">
                {{ item }} <span v-if="index !== selectedCountryToShow.importation.length - 1 && selectedCountryToShow.importation.length !== 1"> ,</span>
              </span>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              <p>پرچم کشور</p>
              <img :src="selectedCountryToShow.picture"/>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              <p>سرود ملی</p>
              <audio :src="selectedCountryToShow.nationalAnthem"/>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش کشور</div>
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
                v-model="selectedCountryToEdit.name"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">پایتخت</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.capital"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">زبان</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.language"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">واحد پول</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.currency"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">جمعیت</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.population"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">کد سه حرفی</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.iso3"
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
                v-model="selectedCountryToEdit.countryCode"
                type="number"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">فایل تصویری</span>
              <div class="q-mt-sm">
                <img :src="selectedCountryToEdit.picture"/>
              </div>
              <q-btn
                unelevated
                dense
                label="تغییر فایل تصویری"
                class="full-width"
                color="primary"
                @click="changePictureFile"
              />
              <q-file
                outlined
                dense
                v-show="false"
                v-model="newCountryPicture"
                ref="flag"
              />
              <span v-if="Object.keys(newCountryPicture).length !== 0">{{ newCountryPicture.name }}</span>
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">فایل سرود ملی</span>
              <div class="q-mt-sm">
                <audio :src="selectedCountryToEdit.nationalAnthem"/>
              </div>
              <q-btn
                unelevated
                dense
                label="تغییر فایل سرود ملی"
                class="full-width"
                color="primary"
                @click="changeAudioFile"
              />
              <q-file
                outlined
                dense
                v-show="false"
                v-model="newNationalAnthem"
                ref="audio"
              />
              <span v-if="Object.keys(newNationalAnthem).length !== 0">{{ newNationalAnthem.name }}</span>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">صادرات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.export"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">واردات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="selectedCountryToEdit.importation"
              />
            </div>
          </div>
          <div class="col-12">
            <q-btn
              unelevated
              dense
              label="ثبت"
              color="primary"
              class="submit-btn"
              @click="updateCountry"
            >
              <q-inner-loading
                :showing="updateLoading"
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
      detailDialog: false,
      editDialog: false,
      selectedCountryToShow: {},
      selectedCountryToEdit: {},
      newCountryPicture: '',
      newNationalAnthem: '',
      updateLoading: false,
      selectedCountryCountryCode: null,
      selectedCountryIso3: ''
    }
  },
  methods: {
    setCountry() {
      this.isLoading = true
      let isCountryCodeReiterative = false;
      let isIso3Reiterative = false;
      let importation = []
      let exportation = []
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
        // importation = this.countryData.importation.split('\\')
        // exportation = this.countryData.exportation.split('\\')
        fd.append("capital", this.countryData.capital)
        fd.append("countryCode", this.countryData.countryCode)
        fd.append("currency", this.countryData.currency)
        fd.append("iso3", this.countryData.iso3)
        fd.append("name", this.countryData.name)
        fd.append("language", this.countryData.language)
        fd.append("population", this.countryData.population)
        fd.append("importation", this.countryData.importation)
        fd.append("export", this.countryData.exportation)
        fd.append("picture", this.countryData.picture)
        fd.append("nationalAnthem", this.countryData.nationalAnthem)

        for (let i = 0; i < this.countries.length; i++) {
          if (this.countries[i].countryCode === Number(this.countryData.countryCode)) {
            console.log(this.countries[i].countryCode)
            isCountryCodeReiterative = true;
          }
          if (this.countries[i].iso3.toLowerCase() === this.countryData.iso3.toLowerCase()) {
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
              this.getCountries()
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
    },
    openDetailDialog(country) {
      this.detailDialog = !this.editDialog
      this.selectedCountryToShow = country
      console.log(this.selectedCountryToShow)
    },
    openEditDialog(country) {
      this.editDialog = !this.editDialog
      this.selectedCountryToEdit = country
      this.selectedCountryCountryCode = this.selectedCountryToEdit.countryCode
      this.selectedCountryIso3 = this.selectedCountryToEdit.iso3
      this.selectedCountryToEdit.export = this.selectedCountryToEdit.export.toString().replaceAll(',', '\\')
      this.selectedCountryToEdit.importation = this.selectedCountryToEdit.importation.toString().replaceAll(',', '\\')
    },
    updateCountry() {
      this.updateLoading = true
      let isCountryCodeReiterative = false;
      let isIso3Reiterative = false;
      let fd = new FormData()
      this.countries = this.countries.filter(country => {
        return country.id !== this.selectedCountryToEdit.id
      })

      for (let i = 0; i < this.countries.length; i++) {
        if (Number(this.countries[i].countryCode) === Number(this.selectedCountryToEdit.countryCode)) {
          isCountryCodeReiterative = true;
        }
        if (this.countries[i].iso3.toLowerCase() === this.selectedCountryToEdit.iso3.toLowerCase()) {
          isIso3Reiterative = true;
        }
      }

      fd.append("capital", this.selectedCountryToEdit.capital)
      fd.append("countryCode", this.selectedCountryToEdit.countryCode)
      fd.append("currency", this.selectedCountryToEdit.currency)
      fd.append("iso3", this.selectedCountryToEdit.iso3)
      fd.append("name", this.selectedCountryToEdit.name)
      fd.append("language", this.selectedCountryToEdit.language)
      fd.append("population", this.selectedCountryToEdit.population)
      fd.append("importation", this.selectedCountryToEdit.importation)
      fd.append("export", this.selectedCountryToEdit.export)
      fd.append("id", this.selectedCountryToEdit.id)
      fd.append("picture", this.newCountryPicture)
      fd.append("nationalAnthem", this.newNationalAnthem)

      if (isCountryCodeReiterative || isIso3Reiterative) {
        this.$q.notify({
          type: 'negative',
          message: 'کد کشور و یا کد سه حرفی تکراری میباشد.'
        })
        this.updateLoading = false
      } else {
        if (this.newCountryPicture) {
          if (this.newCountryPicture.type !== 'image/png') {
            this.$q.notify({
              type: 'negative',
              message: 'نوع فایل تصویری باید بصورت png باشد.'
            })
            this.updateLoading = false
          }
        }
        if (this.newNationalAnthem) {
          if (this.newNationalAnthem.type !== 'audio/mpeg') {
            this.$q.notify({
              type: 'negative',
              message: 'نوع فایل صوتی باید بصورت mp3 باشد.'
            })
            this.updateLoading = false
          }
        }

        axios.put(vars.api_base3 + '/Country/UpdateCountry', fd).then(response => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'اطلاعات کشور با موفقیت ثبت شد.'
            })
            this.getCountries()
            this.editDialog = false
            this.updateLoading = false
            this.newNationalAnthem = ''
            this.newCountryPicture = ''
          }
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            message: 'مشکلی پیش آمد.'
          })
          this.updateLoading = false
        })
      }
    },
    deleteCountry(countryId) {
      axios.delete(vars.api_base3 + `/Country/DeleteCountry?id=${countryId}`).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'کشور با موفقیت حذف شد.'
          })
          this.getCountries()
        }
      }).catch(error => {
        console.log(error)
      })
    },
    changePictureFile() {
      this.$refs.flag.pickFiles();
    },
    changeAudioFile() {
      this.$refs.audio.pickFiles();
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
