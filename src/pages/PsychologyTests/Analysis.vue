<template>
  <div class="analysis-container">
    <div class="row">
      <div class="col-12">
        <div class="flex justify-between">
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
            :pagination="pagination"
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
          <div class="col-12 col-md-6">
            <q-input
              dense
              outlined
              v-model="selectedAnalysisToEdit.minScore"
              label="حداقل امتیاز"
              stack-label
              class="q-ml-sm"
              type="number"
              min="0"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              dense
              outlined
              v-model="selectedAnalysisToEdit.maxScore"
              label="حداکثر امتیاز"
              stack-label
              class="q-ml-sm"
              type="number"
              min="0"
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span>متن آنالیز:</span>
            <q-input
              dense
              outlined
              v-model="selectedAnalysisToEdit.text"
              type="textarea"
              class="q-mt-lg"
              required
            />
          </div>
          <div class="col-12 q-mt-md flex justify-end">
            <q-btn
              dense
              unelevated
              label="ثبت"
              color="primary"
              style="width: 15%"
              @click="editAnalysis"
            />
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
              v-model="selectTestForAnalysis.id"
              :options="tests"
              :option-label="'text'"
              :option-value="'id'"
              emit-value
              map-options
              style="min-width: 150px"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <span class="label">حداقل امتیاز</span>
            <q-input
              dense
              outlined
              v-model="minScore"
              stack-label
              type="number"
              min="0"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <div class="second-input">
              <span class="label">حداکثر امتیاز</span>
              <q-input
                dense
                outlined
                v-model="maxScore"
                stack-label
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <span class="label">متن آنالیز:</span>
            <q-input
              dense
              outlined
              v-model="analysisText"
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
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import * as axios from 'axios'
import vars from 'src/vars'

export default defineComponent({
  name: 'Analysis',
  data () {
    return {
      tests: [],
      testOptions: [],
      selectedTest: {},
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'left', label: 'متن', field: 'text' },
        { name: 'score', align: 'left', label: 'امتیاز', field: 'score' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      analyses: [],
      selectTestForAnalysis: {},
      minScore: null,
      maxScore: null,
      analysisText: '',
      editDialog: false,
      selectedAnalysisToEdit: {},
      createDialog: false
    }
  },
  created () {
    this.getTests()
    this.getAnalyses()
  },
  methods: {
    getTests () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetPsychologyTest').then(response => {
        this.testOptions = [{
          id: 0,
          text: 'همه'
        }, ...response.data.item]
        this.tests = response.data.item
        // console.log(this.tests)
        this.selectedTest.id = this.testOptions.find(test => test.id === 0).id
      }).catch(error => {
        console.log(error)
      })
    },
    getAnalyses () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetTypeQuestion').then(response => {
        this.analyses = response.data.item
      }).catch(error => {
        console.log(error)
      })
    },
    changeAnalyses () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetTypeQuestion').then(response => {
        if (this.selectedTest.id === 0) {
          this.analyses = response.data.item
        } else {
          this.analyses = response.data.item.filter(analysis => {
            return analysis.psychologytestid === this.selectedTest.id
          })
        }
      }).catch(error => {
        console.log(error)
      })
    },
    setAnalysis () {
      if (!this.selectTestForAnalysis || !this.minScore || !this.analysisText) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد کنید.'
        })
      } else {
        const score = []
        score.push(Number(this.minScore))
        if (this.maxScore) {
          score.push(Number(this.maxScore))
        }
        axios.post(vars.api_base + '/api/PsychologicalAssay/CreateTypeQuestion', {
          psychologyTestId: this.selectTestForAnalysis.id,
          text: this.analysisText,
          score: score
        }).then(response => {
          this.$q.notify({
            type: 'positive',
            message: 'تحلیل تست اضافه شد.'
          })
          this.selectTestForAnalysis = {}
          this.minScore = null
          this.maxScore = null
          this.analysisText = ''
          this.getAnalyses()
        }).catch(error => {
          console.log(error)
        })
      }
    },
    openEditDialog (analysis) {
      this.editDialog = !this.editDialog
      this.selectedAnalysisToEdit = analysis
      if (this.selectedAnalysisToEdit.score.includes('[')) {
        this.selectedAnalysisToEdit.minScore = Number(this.selectedAnalysisToEdit.score[1])
        this.selectedAnalysisToEdit.maxScore = Number(this.selectedAnalysisToEdit.score[4])
      } else {
        this.selectedAnalysisToEdit.minScore = Number(this.selectedAnalysisToEdit.score)
        this.selectedAnalysisToEdit.maxScore = null
      }
    },
    editAnalysis () {
      if (!this.selectedAnalysisToEdit.text || !this.selectedAnalysisToEdit.minScore) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد کنید.'
        })
      } else {
        const score = []
        score.push(Number(this.selectedAnalysisToEdit.minScore))
        if (this.selectedAnalysisToEdit.maxScore) {
          score.push(Number(this.selectedAnalysisToEdit.maxScore))
        }
        axios.post(vars.api_base + '/api/PsychologicalAssay/UpdateTypeQuestion', {
          id: this.selectedAnalysisToEdit.id,
          text: this.selectedAnalysisToEdit.text,
          score: score
        }).then(response => {
          this.$q.notify({
            type: 'positive',
            message: 'تحلیل تست با موفقیت ویرایش شد.'
          })
          this.getAnalyses()
          this.editDialog = !this.editDialog
        }).catch(error => {
          console.log(error)
        })
      }
    },
    deleteAnalysis (id) {
      const payload = { id: id }
      axios.post(vars.api_base + '/api/PsychologicalAssay/DeleteTypeQuestion', payload).then(response => {
        this.$q.notify({
          type: 'info',
          message: 'تحلیل تست حذف شد.'
        })
        this.getAnalyses()
      }).catch(error => {
        console.log(error)
        this.$q.notify({
          type: 'negative',
          message: 'مشکلی پیش آمد.'
        })
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
