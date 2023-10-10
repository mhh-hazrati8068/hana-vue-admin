<template>
  <div class="answers-container">
    <q-input
      v-model="search"
      outlined
      dense
      placeholder="جستجو در پاسخ ها ..."
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
          <span class="title">پاسخ&zwnj;های موجود</span>
          <q-select
            dense
            outlined
            v-model="selectQuestionToShow.id"
            :options="questionOptions"
            :option-value="'id'"
            :option-label="'text'"
            label="انتخاب سوال"
            emit-value
            map-options
            class="q-ml-md"
            style="min-width: 150px"
            @update:model-value="changeAnswers"
          />
        </div>
      </div>
      <div class="col-12">
        <div class="answer-wrapper">
          <q-table
            :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
            :columns="columns"
            :rows="answers"
            v-model:pagination="pagination"
            :loading="loading"
            @request="getAnswers"
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
                    @click="deleteAnswer(props.row)"
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
          label="افزودن پاسخ"
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
        <div class="text-h6">ویرایش پاسخ</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-mt-md">
            <span class="label">متن پاسخ</span>
            <q-input
              dense
              outlined
              v-model="selectedAnswerToEdit.text"
            />
          </div>
          <div class="col-12 q-mt-md">
            <span class="label">امتیاز</span>
            <q-input
              dense
              outlined
              v-model="selectedAnswerToEdit.score"
              type="number"
              min="0"
            />
          </div>
          <div class="col-12 q-mt-md">
            <span class="label">انتخاب سوال</span>
            <q-select
              dense
              outlined
              v-model="selectedAnswerToEdit.question_id"
              :options="questionsForEditAnswer"
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
              @click="editAnswer"
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
        <div class="text-h6">افزودن پاسخ</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6 q-mt-md" v-if="!this.$route.query.questionId || chooseQuestion">
            <div class="select-test-question">
              <span class="label">انتخاب تست</span>
              <q-select
                dense
                outlined
                v-model="selectedTest.id"
                :options="tests"
                :option-value="'id'"
                :option-label="'text'"
                emit-value
                map-options
                @update:model-value="getQuestions"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md" v-if="!this.$route.query.questionId || chooseQuestion">
            <div class="select-test-question second-input">
              <span class="label">انتخاب سوال</span>
              <q-select
                dense
                outlined
                v-model="selectedQuestion.id"
                :options="questions"
                :option-value="'id'"
                :option-label="'text'"
                emit-value
                map-options
                :disable="Object.keys(selectedTest).length === 0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <span class="label">انتخاب پاسخ&zwnj;های موجود</span>
            <q-option-group
              :options="answersOfSelectedQuestion"
              v-model="selectedAnswers"
              type="checkbox"
            />
          </div>
          <div class="col-12 col-md-4 q-mb-md q-mt-md">
            <div class="second-input">
              <span class="label">قالب پاسخ</span>
              <q-option-group
                :options="answerTemplateOptions"
                v-model="answerTemplate"
                class="q-mt-md flex justify-between"
                @update:model-value="saveTemplate"
                :disable="selectedAnswers.length > 0"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md" v-if="answerTemplate === 1">
            <span class="label">الگو پاسخ</span>
            <q-select
              dense
              outlined
              v-model="selectedPattern"
              :options="answerPatterns"
              class="q-mb-md"
              @update:model-value="savePattern"
              :disable="selectedAnswers.length > 0"
            />
            <div class="" v-for="(pattern, index) in selectedPattern.options" :key="index">
              <div class="pattern flex q-my-md" style="align-items: center">
                <span style="min-width: 100px">{{ pattern.label }}</span>
                <q-input
                  dense
                  outlined
                  type="number"
                  class="q-ml-md"
                  v-model="pattern.score"
                />
              </div>
            </div>
          </div>
          <div class="col-12 q-mt-md" v-if="answerTemplate === 2">
            <span class="label">متن پاسخ</span>
            <q-input
              dense
              outlined
              v-model="answerText"
              class="q-mb-md"
              :disable="selectedAnswers.length > 0"
            />
          </div>
          <div class="col-12 col-md-4" v-if="answerTemplate === 2">
            <span class="label">امتیاز</span>
            <q-input
              dense
              outlined
              v-model="score"
              type="number"
              min="0"
              :disable="selectedAnswers.length > 0"
            />
          </div>
          <div class="col-12 q-mt-md flex justify-center">
            <q-btn
              dense
              unelevated
              label="ثبت پاسخ"
              color="primary"
              class="submit-btn"
              @click="setAnswer"
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
        <div class="text-h6">جزئیات پاسخ</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="q-my-lg">
          متن: {{ selectedAnswerToShow.text }}
        </div>
        <div class="q-my-lg">
          امتیاز: {{ selectedAnswerToShow.score }}
        </div>
        <div class="q-my-lg">
          سوال: {{ selectedAnswerToShow.question }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import * as axios from 'axios'
import vars from '../../vars'
import { useMeta } from 'quasar'

const metaData = {
  title: 'پاسخ ها'
}

export default defineComponent({
  name: 'Answers',
  setup() {
    useMeta(metaData)
  },
  data () {
    return {
      questionId: null,
      currentQuestion: {},
      answerTemplateOptions: [
        { label: 'الگوها', value: 1 },
        { label: 'متنی', value: 2 }
      ],
      answerTemplate: 0,
      answerText: '',
      tests: [],
      selectedTest: {},
      answerPatterns: this.$store.state.answerPattern.patterns,
      selectedPattern: {},
      questions: [],
      selectedQuestion: {},
      score: null,
      answers: [],
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'left', label: 'متن پاسخ', field: 'text' },
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
      questionOptions: [],
      selectQuestionToShow: {},
      chooseQuestion: false,
      editDialog: false,
      selectedAnswerToEdit: {},
      createDialog: false,
      loading: false,
      qBody: {
        take: 20,
        skip: 0
      },
      isLoading: false,
      updateLoading: false,
      search: '',
      answersOfSelectedQuestion: [],
      selectedAnswers: [],
      allAnswers: [],
      questionsForEditAnswer: [],
      detailDialog: false,
      selectedAnswerToShow: {},
    }
  },
  created () {
    if (this.$route.query) {
      this.questionId = Number(this.$route.query.questionId)
    }
    this.getTest()
    this.getAnswers()
    this.getQuestions()
    this.getQuestionOptions()
    this.getLocalStorage()
  },
  methods: {
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
    getQuestions () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: null,
        IsExportFile: true
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.questions = response.data.items.filter(question => {
            return question.psychology_test_id === this.selectedTest.id
          })
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

      if (this.selectedTest.id) {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoAnswer', {
          PsychologyTestId: this.selectedTest.id,
          IsExportFile: true
        },{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(response => {
          if (response.data.isSuccess) {
            this.allAnswers = response.data.items
            this.answersOfSelectedQuestion = response.data.items
            // console.log(this.answersOfSelectedQuestion)
            for (let i = 0; i < this.answersOfSelectedQuestion.length; i++) {
              this.answersOfSelectedQuestion[i].label = this.answersOfSelectedQuestion[i].text
              this.answersOfSelectedQuestion[i].value = this.answersOfSelectedQuestion[i].id
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
      }
    },
    setAnswer () {
      this.isLoading = true
      if (!this.questionId) {
        if (Object.keys(this.selectedQuestion).length === 0) {
          this.$q.notify({
            type: 'negative',
            message: 'لطفا سوال را انتخاب کنید.'
          })
          this.isLoading = false
          return false
        }
      }
      if ((this.answerTemplate === 0 || (this.answerTemplate === 1 &&
        Object.keys(this.selectedPattern).length === 0)) && this.selectedAnswers.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا الگوی پاسخ را انتخاب کنید.'
        })
        this.isLoading = false
        return false
      }
      if ((this.answerTemplate === 2 && this.answerText === '') && this.selectedAnswers.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا متن پاسخ را وارد کنید.'
        })
        this.isLoading = false
        return false
      }
      if ((this.answerTemplate === 2 && this.score === null) && this.selectedAnswers.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا امتیاز پاسخ را وارد کنید.'
        })
        this.isLoading = false
        return false
      }
      // console.log(this.selectedPattern.value.label)
      // console.log(this.selectedQuestion.id)
      if (this.selectedAnswers.length > 0) {
        this.answerTemplate = 0
        for (let i = 0; i < this.selectedAnswers.length; i++) {
          const answer = this.allAnswers.filter(answer => {
            return answer.id === this.selectedAnswers[i]
          })
          // console.log(this.selectedAnswers)
          // console.log(answer)
          axios.post(vars.api_base2 + '/api/PsychologicalAssay/CreateFargoAnswer', {
            questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
            text: answer[0].text,
            score: answer[0].score
          },{
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          }).then(response => {
            // console.log(response)
            if (response.data.isSuccess) {
              this.$q.notify({
                type: 'positive',
                message: 'پاسخ جدید اضافه شد.'
              })
              this.selectedTest = {}
              this.selectedQuestion = {}
              this.selectedPattern = {}
              this.createDialog = false
              this.selectedAnswers = []
              this.getAnswers()
              this.isLoading = false
              this.answersOfSelectedQuestion = []
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
        return true
      }
      if (this.answerTemplate === 2) {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/CreateFargoAnswer', {
          questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
          text: this.answerText,
          score: Number(this.score)
        },{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(response => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'پاسخ جدید اضافه شد.'
            })
            this.answerText = ''
            this.score = null
            // this.answerTemplate = 0
            this.selectedTest = {}
            this.selectedQuestion = {}
            this.createDialog = false
            this.getAnswers()
            this.isLoading = false
            this.answersOfSelectedQuestion = []
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
      } else if (this.answerTemplate === 1) {
        for (let i = 0; i < this.selectedPattern.value; i++) {
          console.log(this.selectedPattern);
          axios.post(vars.api_base2 + '/api/PsychologicalAssay/CreateFargoAnswer', {
            questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
            text: this.selectedPattern.options[i].label,
            score: Number(this.selectedPattern.options[i].score)
          },{
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          }).then(response => {
            // console.log(response)
            if (response.data.isSuccess) {
              this.$q.notify({
                type: 'positive',
                message: 'پاسخ جدید اضافه شد.'
              })
              this.selectedTest = {}
              this.selectedQuestion = {}
              this.selectedPattern = {}
              this.createDialog = false
              this.getAnswers()
              this.isLoading = false
              this.answersOfSelectedQuestion = []
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
      }
    },
    getAnswers (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoAnswer', {
        SearchQuery: null,
        Take: this.qBody.take,
        Skip: this.qBody.skip,
        IsExportFile: false,
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.pagination.rowsNumber = response.data.count
          this.pagination.page = reqProps?.pagination.page ?? 1
          if (!this.questionId || this.selectQuestionToShow.id === 0) {
            this.answers = response.data.items
          } else if (this.questionId) {
            this.answers = response.data.items.filter(answer => {
              return answer.question_id === Number(this.questionId)
            })
          } else if (this.selectQuestionToShow.id !== 0) {
            this.answers = response.data.items.filter(answer => {
              return answer.question_id === this.selectQuestionToShow.id
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
      }).then(() => {
        this.loading = false
      })
    },
    getQuestionOptions () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: null,
        IsExportFile: true,
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.questionOptions = [{
            id: 0,
            text: 'همه'
          }, ...response.data.items
          ]
          if (this.$route.query.questionId) {
            this.selectQuestionToShow.id = this.questionOptions.find(question => {
              return question.id === Number(this.$route.query.questionId)
            })
          } else {
            this.selectQuestionToShow.id = this.questionOptions.find(question => {
              return question.id === 0
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
    changeAnswers () {
      // console.log(this.selectQuestionToShow)
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoAnswer', {
        searchQuery: null,
        IsExportFile: true
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          if (this.selectQuestionToShow.id === 0) {
            this.answers = response.data.items
          } else {
            this.answers = response.data.items.filter(answer => {
              return answer.question_id === this.selectQuestionToShow.id
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
      }).catch(err => {
        console.log(err)
        for (let i = 0; i < err.response.data.exceptions.length; i++) {
          this.$q.notify({
            type: 'negative',
            message: err.response.data.exceptions[i].persianDescription
          })
        }
      })
    },
    saveTemplate () {
      localStorage.setItem('answer-template', this.answerTemplate)
    },
    savePattern () {
      localStorage.setItem('answer-pattern', this.selectedPattern.value)
    },
    getLocalStorage () {
      this.answerPatterns = this.$store.state.answerPattern.patterns
      if (localStorage.getItem('answer-pattern')) {
        this.selectedPattern = this.answerPatterns.find(pattern => {
            return pattern.value === Number(localStorage.getItem('answer-pattern'))
        })
      } else {
        this.selectedPattern = this.answerPatterns[0];
      }
      console.log(this.selectedPattern)
      if (localStorage.getItem('answer-template')) {
        this.answerTemplate = Number(localStorage.getItem('answer-template'))
      }
    },
    deleteAnswer (answer) {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/DeleteFargoAnswer', {
        Id_: answer.id
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'پاسخ حذف شد.'
          })
          this.getAnswers()
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
    openEditDialog (answer) {
      this.editDialog = !this.editDialog
      this.selectedAnswerToEdit = answer
      // console.log(this.selectedAnswerToEdit)
      this.getQuestionsForEdit()
    },
    editAnswer () {
      this.updateLoading = true
      if (this.selectedAnswerToEdit.text === '' || this.selectedAnswerToEdit.score === null) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد نمایید.'
        })
        this.updateLoading = false
      } else {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/UpdateFargoAnswer', {
          id: this.selectedAnswerToEdit.id,
          text: this.selectedAnswerToEdit.text,
          score: Number(this.selectedAnswerToEdit.score),
          questionId: this.selectedAnswerToEdit.question_id
        },{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(response => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'پاسخ با موفقیت ویرایش شد.'
            })
            this.getAnswers()
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
      }
    },
    getSearchItems () {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoAnswer', {
        SearchQuery: this.search,
        IsExportFile: false,
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.answers = response.data.items
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
    getQuestionsForEdit() {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: null,
        IsExportFile: true
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.questionsForEditAnswer = response.data.items
          // console.log(this.questionsForEditAnswer)
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
    openDetailDialog(answer) {
      this.detailDialog = !this.detailDialog
      this.selectedAnswerToShow = answer
      // console.log(this.selectedAnswerToShow)
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetFargoQuestion', {
        SearchQuery: null,
        IsExportFile: true
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          this.selectedAnswerToShow.question = response.data.items.filter(question => {
            return question.id === this.selectedAnswerToShow.question_id
          })[0].text
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
    }
  }
})
</script>

<style lang="scss" scoped>
.answers-container {
  padding: 1rem;
  .title {
    font-size: 1.1rem;
    display: inline-block;
  }
  .create-answer-container {
    //margin-top: 2rem;
    .select-test-question {
      margin-top: 2rem;
    }
  }
  .answer-wrapper {
    margin-top: 2rem;
  }
}
</style>
