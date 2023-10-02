<template>
  <div class="questions-container">
    <q-input
      v-model="search"
      outlined
      dense
      placeholder="جستجو در سوال ها ..."
      class="q-mb-md"
      @update:model-value="getQuestions"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="row">
      <div class="col-12">
        <div class="flex justify-between" style="align-items: center; margin-top: 2rem">
          <span class="title">سوال&zwnj;های موجود</span>
          <q-select
            dense
            outlined
            v-model="selectedTest.id"
            :options="selectOptions"
            :option-value="'id'"
            :option-label="'text'"
            label="انتخاب تست"
            emit-value
            map-options
            class="q-ml-md"
            style="min-width: 150px"
            @update:model-value="changeQuestions"
          />
        </div>
      </div>
      <div class="col-12">
        <div class="questions-wrapper">
          <q-table
            :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
            :columns="columns"
            :rows="questions"
            v-model:pagination="pagination"
            :loading="loading"
            @request="getQuestions"
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
                    :class="{ 'row-numbers': col.field === 'counter', 'description': col.field === 'text' }"
                  >
                    {{ col.value }}
                  </span>
                  <q-btn
                    v-if="col.field === 'answersBtn'"
                    unelevated
                    dense
                    label="مشاهده پاسخ&zwnj;ها"
                    class="text-primary"
                    style="font-size: .75rem"
                    @click="goToAnswers(props.row.id)"
                  />
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
                    @click="deleteQuestion(props.row.id)"
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
          label="افزودن سوال"
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
        <div class="text-h6">ویرایش سوال</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <span class="label">متن سوال</span>
            <q-input
              dense
              outlined
              v-model="selectedQuestionToEdit.text"
              autogrow
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">انتخاب تست</span>
            <q-select
              dense
              outlined
              v-model="selectedQuestionToEdit.psychology_test_id"
              :options="tests"
              :option-value="'id'"
              :option-label="'text'"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 q-mt-md flex justify-end">
            <q-btn
              dense
              unelevated
              label="ثبت"
              color="primary"
              class="submit-btn"
              @click="updateQuestion"
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
        <div class="text-h6">افزودن سوال</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-mt-sm">
            <span class="label">متن سوال</span>
            <q-input
              dense
              outlined
              v-model="questionData.text"
              autogrow
            />
          </div>
          <div class="col-12 q-mt-sm">
            <span class="label">انتخاب تست</span>
            <q-select
              dense
              outlined
              v-model="questionData.psychologyTestId"
              :options="tests"
              :option-value="'id'"
              :option-label="'text'"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 q-mt-md flex justify-center">
            <q-btn
              dense
              unelevated
              label="ثبت سوال"
              color="primary"
              class="submit-btn"
              @click="setQuestion"
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
        <div class="text-h6">جزئیات سوال</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="q-my-lg">
          متن: {{ selectedQuestionToShow.text }}
        </div>
        <div class="q-my-lg">
          تست: {{ selectedQuestionToShow.test }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import vars from '../../vars'
import * as axios from 'axios'
import { useMeta } from 'quasar'

const metaData = {
  title: 'تست\u200Cهای روانشناسی - سوال\u200Cها'
}

export default defineComponent({
  name: 'Questions',
  setup() {
    useMeta(metaData)
  },
  data () {
    return {
      questions: [],
      testId: null,
      questionData: {
        psychologyTestId: null,
        text: ''
      },
      tests: [],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'left', label: 'متن سوال', field: 'text' },
        { name: 'answersBtn', align: 'center', label: '', field: 'answersBtn' },
        { name: 'detail', align: 'center', label: '', field: 'detail'},
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      selectedTest: {},
      selectOptions: [],
      editDialog: false,
      selectedQuestionToEdit: {},
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
      selectedQuestionToShow: {}
    }
  },
  created () {
    if (this.$route.query.testId) {
      this.testId = Number(this.$route.query.testId)
    }
    this.getQuestions()
    this.getTest()
  },
  methods: {
    getQuestions (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: this.search ? this.search : null,
        Take: this.qBody.take,
        Skip: this.qBody.skip,
        IsExportFile: false,
        PsychologyTestId: this.testId ? this.testId : null
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.pagination.rowsNumber = response.data.count
          this.pagination.page = reqProps?.pagination.page ?? 1
          this.questions = response.data.items
          if (this.testId !== null) {
            this.questions = this.questions.filter(question => {
              return question.psychology_test_id === this.testId
            })
          }
          // console.log(this.questions)
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
    getTest () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetTest', {
        SearchQuery: null,
        IsExportFile: true
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.tests = response.data.items
          // console.log(this.tests)
          this.selectOptions = [{
            id: 0,
            text: 'همه'
          }, ...response.data.items
          ]
          if (this.testId !== null) {
            this.selectedTest.id = this.tests.find(test => test.id === this.testId).id
          } else {
            this.selectedTest.id = this.selectOptions.find(test => test.id === 0).id
          }
          // console.log(this.selectedTest)
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
    setQuestion () {
      // console.log(this.questionData)
      this.isLoading = true
      if (this.questionData.text !== '' && this.questionData.psychologyTestId !== null) {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/CreateFargoQuestion', this.questionData,{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(response => {
          // console.log(response)
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'سوال جدید اضافه شد.'
            })
            this.createDialog = false
            this.getQuestions()
            this.questionData = {
              psychologyTestId: null,
              text: ''
            }
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
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
        this.isLoading = false
      }
    },
    changeQuestions () {
      // console.log(this.selectedTest)
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: null,
        IsExportFile: true,
        PsychologyTestId: this.selectedTest.id ? this.selectedTest.id : null
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          if (this.selectedTest.id === 0) {
            this.questions = response.data.items
          } else {
            this.questions = response.data.items.filter(question => {
              return question.psychology_test_id === this.selectedTest.id
            })
          }
          // console.log(this.questions)
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
    goToAnswers (questionId) {
      this.$router.push({
        name: 'answers',
        query: { questionId: questionId }
      })
    },
    openEditDialog (question) {
      this.editDialog = !this.editDialog
      this.selectedQuestionToEdit = question
    },
    updateQuestion () {
      this.updateLoading = true
      if (this.selectedQuestionToEdit.text !== '') {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/UpdateFargoQuestion', {
          text: this.selectedQuestionToEdit.text,
          psychologyTestId: this.selectedQuestionToEdit.psychology_test_id,
          id: this.selectedQuestionToEdit.id
        },{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(response => {
          // console.log(response)
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'سوال با موفقیت ویرایش شد.'
            })
            this.getQuestions()
            this.editDialog = !this.editDialog
            this.updateLoading = false
          } else {
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[i].persianDescription
              })
            }
            this.updateLoading = false
          }
        }).catch(error => {
          console.log(error)
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: error.response.data.exceptions[i].persianDescription
            })
          }
          this.updateLoading = false
        })
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
        this.updateLoading = false
      }
    },
    deleteQuestion (questionId) {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/DeleteFargoQuestion', {
        Id_: questionId
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'سوال حذف شد.'
          })
          this.getQuestions()
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
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: this.search,
        Take: null,
        Skip: null,
        PsychologyTestId: null,
        IsExportFile: false,
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.questions = response.data.items
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
    openDetailDialog(question) {
      this.detailDialog = !this.detailDialog
      this.selectedQuestionToShow = question
      this.selectedQuestionToShow.test = this.tests.filter(test => {
        return test.id === this.selectedQuestionToShow.psychology_test_id
      })[0].text
      // console.log(this.selectedQuestionToShow)
    }
  }
})
</script>

<style lang="scss" scoped>
.questions-container {
  padding: 1rem;
  .title {
    font-size: 1.1rem;
    display: inline-block;
  }
  .create-question-container {
    margin-top: 2rem;
    @media (min-width: 1024px) {
      .q-select {
        margin-left: 1.5rem;
      }
    }
  }
  .questions-wrapper {
    margin-top: 2rem;
  }
}
</style>
