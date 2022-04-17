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
          <span class="title">استان&zwnj;های ثبت شده</span>
        </div>
        <div class="col-12">
          <q-table
            :columns="columns"
            :rows="states"
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
            label="افزودن استان"
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
        <div class="text-h6">افزودن استان</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">انتخاب کشور</span>
              <q-select
                outlined
                dense
                v-model="stateData.countryId"
                :options="countries"
                :option-label="'name'"
                :option-value="'id'"
                emit-value
                map-options
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">dialect</span>
              <q-input
                outlined
                dense
                v-model="stateData.dialect"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">state</span>
              <q-input
                outlined
                dense
                v-model="stateData.state"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">weather</span>
              <q-input
                outlined
                dense
                v-model="stateData.weather"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">soilAndEarth</span>
              <q-input
                outlined
                dense
                v-model="stateData.soilAndEarth"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">population</span>
              <q-input
                outlined
                dense
                v-model="stateData.population"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">stateCode</span>
              <q-input
                outlined
                dense
                v-model="stateData.stateCode"
                type="number"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">center</span>
              <q-input
                outlined
                dense
                v-model="stateData.center"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">capacityAndLimitations</span>
              <q-input
                outlined
                dense
                v-model="stateData.capacityAndLimitations"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">products</span>
              <q-input
                outlined
                dense
                v-model="stateData.products"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">water</span>
              <q-input
                outlined
                dense
                v-model="stateData.water"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">فایل تصویری</span>
              <q-file
                outlined
                dense
                v-model="stateData.picture"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">فایل صوتی</span>
              <q-file
                outlined
                dense
                v-model="stateData.nativeSong"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">صادرات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="stateData.exportation"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">واردات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="stateData.importation"
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
              @click="setState"
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
              کد: {{ selectedStateToShow.stateCode }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              کشور: {{ selectedStateToShow.countryId }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              dialect: {{ selectedStateToShow.dialect }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              state: {{ selectedStateToShow.state }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              weather: {{ selectedStateToShow.weather }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              soilAndEarth: {{ selectedStateToShow.soilAndEarth }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              population: {{ selectedStateToShow.population }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              center: {{ selectedStateToShow.center }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              capacityAndLimitations: {{ selectedStateToShow.capacityAndLimitations }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              products: {{ selectedStateToShow.products }}
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div>
              water: {{ selectedStateToShow.water }}
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              صادرات:
              <span v-for="(item, index) of selectedStateToShow.export" :key="index">
                {{ item }} <span v-if="index !== selectedStateToShow.export.length - 1 && selectedStateToShow.export.length !== 1"> ,</span>
              </span>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              واردات:
              <span v-for="(item, index) of selectedStateToShow.importation" :key="index">
                {{ item }} <span v-if="index !== selectedStateToShow.importation.length - 1 && selectedStateToShow.importation.length !== 1"> ,</span>
              </span>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              <p>تصویر</p>
              <img :src="selectedStateToShow.picture"/>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div>
              <p>سرود</p>
              <audio :src="selectedStateToShow.nativeSong"/>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش استان</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">انتخاب کشور</span>
              <q-select
                outlined
                dense
                v-model="selectedStateToEdit.countryId"
                :options="countries"
                :option-label="'name'"
                :option-value="'id'"
                emit-value
                map-options
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">dialect</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.dialect"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">state</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.state"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">weather</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.weather"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">soilAndEarth</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.soilAndEarth"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">population</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.population"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">stateCode</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.stateCode"
                type="number"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">center</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.center"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">capacityAndLimitations</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.capacityAndLimitations"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">products</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.products"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">water</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.water"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">فایل تصویری</span>
              <div class="q-mt-sm">
                <img :src="selectedStateToEdit.picture"/>
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
                v-model="newStatePicture"
                ref="flag"
              />
              <span v-if="Object.keys(newStatePicture).length !== 0">{{ newStatePicture.name }}</span>
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">فایل صوتی</span>
              <div class="q-mt-sm">
                <audio :src="selectedStateToEdit.nationalAnthem"/>
              </div>
              <q-btn
                unelevated
                dense
                label="تغییر فایل صوتی"
                class="full-width"
                color="primary"
                @click="changeAudioFile"
              />
              <q-file
                outlined
                dense
                v-show="false"
                v-model="newNativeSong"
                ref="audio"
              />
              <span v-if="Object.keys(newNativeSong).length !== 0">{{ newNativeSong.name }}</span>
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">صادرات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.export"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <div class="input">
              <span class="label">واردات (هریک از موارد را با \ جدا کنید)</span>
              <q-input
                outlined
                dense
                v-model="selectedStateToEdit.importation"
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
              @click="updateState"
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
        { name: 'stateCode', align: 'center', label: 'کد', field: 'stateCode'},
        { name: 'center', align: 'center', label: 'مرکز', field: 'center'},
        { name: 'detail', align: 'center', label: '', field: 'detail'},
        { name: 'edit', align: 'center', label: '', field: 'edit'},
        { name: 'delete', align: 'center', label: '', field: 'delete'},
      ],
      countries: [],
      states: [],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      loading: false,
      createDialog: false,
      stateData: {
        picture: '',
        nativeSong: '',
        countryId: null,
        stateCode: null,
        dialect: '',
        state: '',
        weather: '',
        soilAndEarth: '',
        population: null,
        center: '',
        importation: '',
        exportation: '',
        capacityAndLimitations: '',
        products: '',
        water: ''
      },
      isLoading: false,
      qBody: {
        take: 20,
        skip: 0
      },
      detailDialog: false,
      editDialog: false,
      selectedStateToShow: {},
      selectedStateToEdit: {},
      newStatePicture: '',
      newNativeSong: '',
      updateLoading: false,
      selectedStateCode: null,
    }
  },
  methods: {
    setState() {
      console.log(this.stateData)
      this.isLoading = true
      let isStateCodeReiterative = false;
      let importation = []
      let exportation = []
      let fd = new FormData()
      if (!this.stateData.picture || !this.stateData.nativeSong || !this.stateData.countryId || !this.stateData.stateCode || !this.stateData.dialect ||
        !this.stateData.state || !this.stateData.weather || !this.stateData.soilAndEarth || !this.stateData.population || !this.stateData.capacityAndLimitations ||
        !this.stateData.center || !this.stateData.importation || !this.stateData.exportation || !this.stateData.products || !this.stateData.water) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.isLoading = false
      } else {
        // importation = this.countryData.importation.split('\\')
        // exportation = this.countryData.exportation.split('\\')
        fd.append("picture_state", this.stateData.picture)
        fd.append("native_song", this.stateData.nativeSong)
        fd.append("countryId", this.stateData.countryId)
        fd.append("stateCode", this.stateData.stateCode)
        fd.append("dialect", this.stateData.dialect)
        fd.append("state", this.stateData.state)
        fd.append("weather", this.stateData.weather)
        fd.append("importation", this.stateData.importation)
        fd.append("export", this.stateData.exportation)
        fd.append("soilAndEarth", this.stateData.soilAndEarth)
        fd.append("population", this.stateData.population)
        fd.append("capacityAndLimitations", this.stateData.capacityAndLimitations)
        fd.append("center", this.stateData.center)
        fd.append("products", this.stateData.products)
        fd.append("water", this.stateData.water)

        for (let i = 0; i < this.states.length; i++) {
          if (this.states[i].stateCode === Number(this.stateData.stateCode)) {
            console.log(this.states[i].stateCode)
            isStateCodeReiterative = true;
          }
        }
        if (isStateCodeReiterative) {
          this.$q.notify({
            type: 'negative',
            message: 'کد استان تکراری میباشد.'
          })
          this.isLoading = false
        } else if (this.stateData.picture.type !== 'image/png') {
          this.$q.notify({
            type: 'negative',
            message: 'نوع فایل تصویری باید بصورت png باشد.'
          })
          this.isLoading = false
        } else if (this.stateData.nativeSong.type !== 'audio/mpeg') {
          this.$q.notify({
            type: 'negative',
            message: 'نوع فایل صوتی باید بصورت mp3 باشد.'
          })
          this.isLoading = false
        } else {
          axios.post(vars.api_base3 + '/State/CreateState', fd).then(response => {
            if (response.data.isSuccess) {
              this.$q.notify({
                type: 'positive',
                message: 'اطلاعات استان با موفقیت ثبت شد.'
              })
              this.stateData = {
                picture: '',
                nativeSong: '',
                countryId: null,
                stateCode: null,
                dialect: '',
                state: '',
                weather: '',
                soilAndEarth: '',
                population: null,
                center: '',
                importation: '',
                exportation: '',
                capacityAndLimitations: '',
                products: '',
                water: ''
              }
              this.getStates()
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
    getStates(reqProps) {
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base3 + '/State/GetState', {
        searchQuery: null,
        stateCode: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false
      }).then(response => {
        this.pagination.rowsNumber = response.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        this.states = response.data.items
      }).catch(error =>{
        console.log(error)
      })
    },
    getAllCountries() {
      axios.post(vars.api_base3 + '/Country/GetCountry', {
        searchQuery: null,
        countryCode: null,
        take: 0,
        skip: 0,
        isExportFile: true,
        fromDateTime: null,
        toDateTime: null
      }).then(response => {
        this.countries = response.data.items
      }).catch(error =>{
        console.log(error)
      })
    },
    openDetailDialog(country) {
      this.detailDialog = !this.editDialog
      this.selectedStateToShow = country
      console.log(this.selectedStateToShow)
    },
    openEditDialog(country) {
      this.editDialog = !this.editDialog
      this.selectedStateToEdit = country
      this.selectedStateCode = this.selectedStateToEdit.stateCode
      this.selectedStateToEdit.export = this.selectedStateToEdit.export.toString().replaceAll(',', '\\')
      this.selectedStateToEdit.importation = this.selectedStateToEdit.importation.toString().replaceAll(',', '\\')
      this.selectedStateToEdit.capacityAndLimitations = this.selectedStateToEdit.capacityAndLimitations.toString().replaceAll(',', '\\')
      this.selectedStateToEdit.products = this.selectedStateToEdit.products.toString().replaceAll(',', '\\')
      console.log(this.selectedStateToEdit)
    },
    updateState() {
      this.updateLoading = true
      let isStateCodeReiterative = false;
      let fd = new FormData()
      const states = this.states.filter(state => {
        return state.id !== this.selectedStateToEdit.id
      })

      for (let i = 0; i < states.length; i++) {
        if (Number(states[i].stateCode) === Number(this.selectedStateToEdit.stateCode)) {
          isStateCodeReiterative = true;
        }
      }

      fd.append("countryId", this.selectedStateToEdit.countryId)
      fd.append("stateCode", this.selectedStateToEdit.stateCode)
      fd.append("dialect", this.selectedStateToEdit.dialect)
      fd.append("state", this.selectedStateToEdit.state)
      fd.append("weather", this.selectedStateToEdit.weather)
      fd.append("importation", this.selectedStateToEdit.importation)
      fd.append("export", this.selectedStateToEdit.export)
      fd.append("soilAndEarth", this.selectedStateToEdit.soilAndEarth)
      fd.append("population", this.selectedStateToEdit.population)
      fd.append("capacityAndLimitations", this.selectedStateToEdit.capacityAndLimitations)
      fd.append("center", this.selectedStateToEdit.center)
      fd.append("products", this.selectedStateToEdit.products)
      fd.append("water", this.selectedStateToEdit.water)
      fd.append("id", this.selectedStateToEdit.id)

      if (isStateCodeReiterative) {
        this.$q.notify({
          type: 'negative',
          message: 'کد کشور و یا کد سه حرفی تکراری میباشد.'
        })
        this.updateLoading = false
      } else {
        if (this.newStatePicture) {
          if (this.newStatePicture.type !== 'image/png') {
            this.$q.notify({
              type: 'negative',
              message: 'نوع فایل تصویری باید بصورت png باشد.'
            })
            this.updateLoading = false
          } else {
            fd.append("picture_state", this.newStatePicture)
          }
        }
        if (this.newNativeSong) {
          if (this.newNativeSong.type !== 'audio/mpeg') {
            this.$q.notify({
              type: 'negative',
              message: 'نوع فایل صوتی باید بصورت mp3 باشد.'
            })
            this.updateLoading = false
          } else {
            fd.append("native_song", this.newNativeSong)
          }
        }

        axios.put(vars.api_base3 + '/State/UpdateState', fd).then(response => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'اطلاعات استان با موفقیت بروزرسانی شد.'
            })
            this.getStates()
            this.editDialog = false
            this.updateLoading = false
            this.newNativeSong = ''
            this.newStatePicture = ''
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
    deleteCountry(stateId) {
      axios.delete(vars.api_base3 + `/State/DeleteState?id=${stateId}`).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'استان با موفقیت حذف شد.'
          })
          this.getStates()
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
    this.getStates()
    this.getAllCountries()
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
