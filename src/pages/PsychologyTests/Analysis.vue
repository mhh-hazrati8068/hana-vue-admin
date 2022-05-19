<template>
  <div class="analysis-container">
    <q-input
      v-model="search"
      outlined
      dense
      placeholder="جستجو کنید..."
      class="q-mb-md"
      @update:model-value="getSearchItems"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="row">
      <div class="col-12">
        <div class="flex justify-between" style="align-items: center; margin-top: 2rem">
          <span class="title">تحلیل&zwnj;های موجود</span>
          <q-select
            dense
            outlined
            v-model="selectedTest.id"
            :options="testOptions"
            :option-label="'text'"
            :option-value="'id'"
            emit-value
            map-options
            style="min-width: 150px"
            label="انتخاب تست"
            @update:model-value="changeAnalyses"
          />
        </div>
      </div>
      <div class="col-12">
        <div class="analysis-wrapper">
          <q-table
            :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
            :columns="columns"
            :rows="analyses"
            v-model:pagination="pagination"
            :loading="loading"
            @request="getAnalyses"
            :rows-per-page-options="[10,20,30,40,50]"
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
              >
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  <span
                    :class="{ 'row-numbers': col.field === 'counter' }"
                  >
                    {{ col.value }}
                  </span>
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
                    @click="openEditDialog(props.row)"
                  />
                  <q-btn
                    v-if="col.field === 'delete'"
                    unelevated
                    dense
                    round
                    icon="delete"
                    class="delete-btn"
                    @click="deleteAnalysis(props.row.id)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
      <div class="col-12 flex justify-end">
        <q-btn
          unelevated
          dense
          label="افزودن تحلیل تست"
          icon-right="add"
          color="primary"
          class="btn q-py-sm q-mt-md"
          @click="createDialog = !createDialog"
        />
      </div>
    </div>
  </div>
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش تحلیل</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-mb-md">
            <span class="label">انتخاب تست</span>
            <q-select
              dense
              outlined
              v-model="selectedAnalysisToEdit.psychology_test_id"
              :options="tests"
              :option-label="'text'"
              :option-value="'id'"
              emit-value
              map-options
              style="min-width: 150px"
              required
            />
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <span class="label">عنوان</span>
            <q-input
              dense
              outlined
              v-model="selectedAnalysisToEdit.tittle"
            />
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <div class="second-input">
              <span class="label">انتخاب تخصص</span>
              <q-select
                dense
                outlined
                v-model="selectedAnalysisToEdit.specialty_id"
                :options="specialties"
                :option-value="'value'"
                :option-label="'label'"
                emit-value
                map-options
                required
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <span class="label">حداقل امتیاز</span>
            <q-input
              dense
              outlined
              v-model="selectedAnalysisToEdit.minScore"
              stack-label
              type="number"
              min="0"
              required
            />
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <div class="second-input">
              <span class="label">حداکثر امتیاز</span>
              <q-input
                dense
                outlined
                v-model="selectedAnalysisToEdit.maxScore"
                stack-label
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 q-mb-md">
            <span class="label">رنگ امتیاز</span>
            <q-input
              filled
              v-model="selectedAnalysisToEdit.color_score"
              class="color"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="selectedAnalysisToEdit.color_score" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 q-mb-md">
            <span class="label">متن آنالیز:</span>
            <q-input
              dense
              outlined
              v-model="selectedAnalysisToEdit.text"
              type="textarea"
              required
            />
          </div>
          <div class="col-12 q-mt-md flex justify-end">
            <q-btn
              dense
              unelevated
              label="ثبت"
              color="primary"
              class="submit-btn"
              @click="editAnalysis"
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
  <q-dialog v-model="createDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">افزودن تحلیل تست&zwnj;ها</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-mb-md">
            <span class="label">انتخاب تست</span>
            <q-select
              dense
              outlined
              v-model="analysisData.psychologyTestId"
              :options="tests"
              :option-label="'text'"
              :option-value="'id'"
              emit-value
              map-options
              style="min-width: 150px"
              required
            />
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <span class="label">عنوان</span>
            <q-input
              dense
              outlined
              v-model="analysisData.tittle"
            />
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <div class="second-input">
              <span class="label">انتخاب تخصص</span>
              <q-select
                dense
                outlined
                v-model="analysisData.specialty_id"
                :options="specialties"
                :option-value="'value'"
                :option-label="'label'"
                emit-value
                map-options
                required
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <span class="label">حداقل امتیاز</span>
            <q-input
              dense
              outlined
              v-model="analysisData.minScore"
              stack-label
              type="number"
              min="0"
              required
            />
          </div>
          <div class="col-12 col-md-6 q-mb-md">
            <div class="second-input">
              <span class="label">حداکثر امتیاز</span>
              <q-input
                dense
                outlined
                v-model="analysisData.maxScore"
                stack-label
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 q-mb-md">
            <span class="label">رنگ امتیاز</span>
            <q-input
              filled
              v-model="analysisData.colorScore"
              class="color"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="analysisData.colorScore" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 q-mb-md">
            <span class="label">متن آنالیز:</span>
            <q-input
              dense
              outlined
              v-model="analysisData.text"
              type="textarea"
              required
            />
          </div>
          <div class="col-12 q-mt-md flex justify-center">
            <q-btn
              dense
              unelevated
              label="ثبت تحلیل تست"
              color="primary"
              class="submit-btn"
              @click="setAnalysis"
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
        <div class="text-h6">جزئیات تحلیل</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="q-my-lg">
          عنوان: {{ selectedAnalysisToShow.tittle }}
        </div>
        <div class="q-my-lg">
          متن: {{ selectedAnalysisToShow.text }}
        </div>
        <div class="q-my-lg">
          تست: {{ selectedAnalysisToShow.test }}
        </div>
        <div class="q-my-lg flex" v-if="selectedAnalysisToShow.score.length > 1">
          <div>
            حداقل امتیاز: {{ selectedAnalysisToShow.score[0] }}
          </div>
          <div class="q-ml-lg">
            حداکثر امتیاز: {{ selectedAnalysisToShow.score[1] }}
          </div>
        </div>
        <div class="q-my-lg" v-if="selectedAnalysisToShow.score.length === 1">
          <div>
            امتیاز: {{ selectedAnalysisToShow.score[0] }}
          </div>
        </div>
        <div class="q-my-lg">
          تخصص: {{ selectedAnalysisToShow.specialty }}
        </div>
        <div class="q-my-lg flex">
          <div>
            رنگ: {{ selectedAnalysisToShow.color_score }}
          </div>
          <div
            style="width: 20px; height: 20px; margin-right: 1rem"
            :style="{ 'background': selectedAnalysisToShow.color_score }"></div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import * as axios from 'axios'
import vars from 'src/vars'
import { useMeta } from 'quasar'

const metaData = {
  title: 'تست\u200Cهای روانشناسی - تحلیل\u200Cها'
}

export default defineComponent({
  name: 'Analysis',
  setup() {
    useMeta(metaData)
  },
  data () {
    return {
      tests: [],
      testOptions: [],
      selectedTest: {},
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'tittle', align: 'left', label: 'متن', field: 'tittle' },
        { name: 'score', align: 'left', label: 'امتیاز', field: 'score' },
        { name: 'detail', align: 'center', label: '', field: 'detail'},
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      analyses: [],
      selectTestForAnalysis: {},
      analysisData: {
        minScore: null,
        maxScore: null,
        text: '',
        tittle: '',
        colorScore: '',
        psychologyTestId: null,
        specialty_id: null
      },
      editDialog: false,
      selectedAnalysisToEdit: {},
      createDialog: false,
      loading: false,
      qBody: {
        take: 20,
        skip: 0
      },
      isLoading: false,
      updateLoading: false,
      search: '',
      detailDialog: false,
      selectedAnalysisToShow: {},
      specialties: []
    }
  },
  created () {
    this.getTests()
    this.getAnalyses()
    this.getSpecialties()
  },
  methods: {
    getTests () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetTest', {
        SearchQuery: null,
        IsExportFile: true,
      }).then(response => {
        if (response.data.isSuccess) {
          this.testOptions = [{
            id: 0,
            text: 'همه'
          }, ...response.data.item.items]
          this.tests = response.data.item.items
          // console.log(this.tests)
          this.selectedTest.id = this.testOptions.find(test => test.id === 0).id
        } else {
          for (let i = 0; i < response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[i].persianDescription
            })
          }
        }
      }).catch(error => {
        console.log(error)
        for (let i = 0; i < error.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.exceptions[i].persianDescription
          })
        }
      })
    },
    getAnalyses (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetReplyPsychology', {
        SearchQuery: null,
        Take: this.qBody.take,
        Skip: this.qBody.skip,
        IsExportFile: false
      }).then(response => {
        if (response.data.isSuccess) {
          this.pagination.rowsNumber = response.data.count
          this.pagination.page = reqProps?.pagination.page ?? 1
          this.analyses = response.data.items
        } else {
          for (let i = 0; i < response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[i].persianDescription
            })
          }
        }
      }).catch(error => {
        console.log(error)
        for (let i = 0; i < error.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.exceptions[i].persianDescription
          })
        }
      }).then(() => {
        this.loading = false
      })
    },
    changeAnalyses () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetReplyPsychology', {
        SearchQuery: null,
        Take: this.qBody.take,
        Skip: this.qBody.skip,
        IsExportFile: true
      }).then(response => {
        if (response.data.isSuccess) {
          if (this.selectedTest.id === 0) {
            this.analyses = response.data.items
          } else {
            this.analyses = response.data.items.filter(analysis => {
              return analysis.psychology_test_id === this.selectedTest.id
            })
          }
        } else {
          for (let i = 0; i < response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[i].persianDescription
            })
          }
        }
      }).catch(error => {
        console.log(error)
        for (let i = 0; i < error.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.exceptions[i].persianDescription
          })
        }
      })
    },
    setAnalysis ()  {
      this.isLoading = true
      if (!this.analysisData.psychologyTestId || !this.analysisData.minScore || !this.analysisData.text ||
          !this.analysisData.tittle || !this.analysisData.colorScore || !this.analysisData.specialty_id) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد کنید.'
        })
        this.isLoading = false
      } else {
        console.log(this.analysisData.specialty_id)
        const score = []
        score.push(Number(this.analysisData.minScore))
        if (this.analysisData.maxScore) {
          score.push(Number(this.analysisData.maxScore))
        }
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/CreateReplyPsychology', {
          text: this.analysisData.text,
          tittle: this.analysisData.tittle,
          colorScore: this.analysisData.colorScore,
          psychologyTestId: this.analysisData.psychologyTestId,
          specialty_id: Number(this.analysisData.specialty_id),
          score
        }).then(response => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'تحلیل تست اضافه شد.'
            })
            this.analysisData = {
              minScore: null,
              maxScore: null,
              text: '',
              tittle: '',
              colorScore: '',
              psychologyTestId: null,
              specialty_id: null
            }
            this.createDialog = false
            this.getAnalyses()
            this.isLoading = false
          } else {
            this.isLoading = false
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[i].persianDescription
              })
            }
          }
        }).catch(error => {
          console.log(error)
          this.isLoading = false
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: error.response.data.exceptions[i].persianDescription
            })
          }
        })
      }
    },
    openEditDialog (analysis) {
      this.editDialog = !this.editDialog
      this.selectedAnalysisToEdit = analysis
      /*if (this.selectedAnalysisToEdit.score.includes('[')) {
        this.selectedAnalysisToEdit.minScore = Number(this.selectedAnalysisToEdit.score[0])
        this.selectedAnalysisToEdit.maxScore = Number(this.selectedAnalysisToEdit.score[1])
      } else {
        this.selectedAnalysisToEdit.minScore = Number(this.selectedAnalysisToEdit.score)
        this.selectedAnalysisToEdit.maxScore = null
      }*/
      this.selectedAnalysisToEdit.minScore = Number(this.selectedAnalysisToEdit.score[0])
      this.selectedAnalysisToEdit.maxScore = Number(this.selectedAnalysisToEdit.score[1])
      // console.log(this.selectedAnalysisToEdit)
    },
    editAnalysis () {
      this.updateLoading = true
      if (!this.selectedAnalysisToEdit.text || !this.selectedAnalysisToEdit.minScore || !this.selectedAnalysisToEdit.tittle ||
          !this.selectedAnalysisToEdit.psychology_test_id || !this.selectedAnalysisToEdit.specialty_id || !this.selectedAnalysisToEdit.color_score) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد کنید.'
        })
        this.updateLoading = false
      } else {
        const score = []
        score.push(Number(this.selectedAnalysisToEdit.minScore))
        if (this.selectedAnalysisToEdit.maxScore) {
          score.push(Number(this.selectedAnalysisToEdit.maxScore))
        }
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/UpdateReplyPsychology', {
          id: this.selectedAnalysisToEdit.id,
          text: this.selectedAnalysisToEdit.text,
          score,
          psychologyTestId: this.selectedAnalysisToEdit.psychology_test_id,
          specialty_id: this.selectedAnalysisToEdit.specialty_id,
          tittle: this.selectedAnalysisToEdit.tittle,
          colorScore: this.selectedAnalysisToEdit.color_score
        }).then(response => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'تحلیل تست با موفقیت ویرایش شد.'
            })
            this.getAnalyses()
            this.editDialog = !this.editDialog
            this.updateLoading = false
          } else {
            this.updateLoading = false
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[i].persianDescription
              })
            }
          }
        }).catch(error => {
          console.log(error)
          this.updateLoading = false
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: error.response.data.exceptions[i].persianDescription
            })
          }
        })
      }
    },
    deleteAnalysis (id) {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/DeleteReplyPsychology', {
        Id_: id
      }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'تحلیل تست حذف شد.'
          })
          this.getAnalyses()
        } else {
          for (let i = 0; i < response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[i].persianDescription
            })
          }
        }
      }).catch(error => {
        console.log(error)
        for (let i = 0; i < error.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.exceptions[i].persianDescription
          })
        }
      })
    },
    getSearchItems () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetReplyPsychology', {
        PsychologyTestId: null,
        SearchQuery: null,
        Take: null,
        Skip: null,
        IsExportFile: true
      }).then(response => {
        if (response.data.isSuccess) {
          this.analyses = response.data.items
        } else {
          for (let i = 0; i < response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[i].persianDescription
            })
          }
        }
      }).catch(error => {
        console.log(error)
        for (let i = 0; i < error.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.exceptions[i].persianDescription
          })
        }
      })
    },
    openDetailDialog(analysis) {
      this.detailDialog = !this.detailDialog
      this.selectedAnalysisToShow = analysis
      this.selectedAnalysisToShow.test = this.tests.filter(test => {
        return test.id === this.selectedAnalysisToShow.psychology_test_id
      })[0].text
      this.selectedAnalysisToShow.specialty = this.specialties.filter(specialty => {
        return specialty.value === this.selectedAnalysisToShow.specialty_id
      })[0].label
      // console.log(this.selectedAnalysisToShow)
    },
    getSpecialties() {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetSpecialty').then(res => {
        if (res.data.isSuccess) {
          for (const key in res.data.items) {
            this.specialties.push({
              value: Number(key),
              label: res.data.items[key]
            })
          }
          // console.log(this.specialties)
        } else {
          for (let i = 0; i < res.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: res.data.exceptions[i].persianDescription
            })
          }
        }
      }).catch(err => {
        console.log(err)
        for (let i = 0; i < err.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: err.response.data.exceptions[i].persianDescription
          })
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.analysis-container {
  padding: 1rem;
  .title {
    font-size: 1.1rem;
    display: inline-block;
  }
  .create-analysis-container {
    margin-top: 2rem;
  }
  .analysis-wrapper {
    margin-top: 2rem;
  }
}
</style>
