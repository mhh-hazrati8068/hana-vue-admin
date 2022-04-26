<template>
  <div class="answers-container">
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
        <div class="flex justify-between" style="align-items: center">
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
            @update:model-value="changeQuestion"
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
              v-model="selectedPattern.value"
              :options="answerPatterns"
              class="q-mb-md"
              @update:model-value="savePattern"
              :disable="selectedAnswers.length > 0"
            />
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
</template>

<script>
import { defineComponent } from 'vue'
import * as axios from 'axios'
import vars from '../../vars'

export default defineComponent({
  name: 'Tests',
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
      answerPatterns: [
        { label: 'دو گزینه\u200Cای', value: 2, options: [{ label: 'بله', score: 1 }, { label: 'خیر', score: 0 }] },
        { label: 'سه گزینه\u200Cای', value: 3, options: [{ label: 'زیاد', score: 2 }, { label: 'متوسط', score: 1 }, { label: 'کم', score: 0 }] },
        { label: 'چهار گزینه\u200Cای', value: 4, options: [{ label: 'زیاد', score: 3 }, { label: 'متوسط', score: 2 }, { label: 'کم', score: 1 }, { label: 'نظری ندارم', score: 0 }] },
        { label: 'پنج گزینه\u200Cای', value: 5, options: [{ label: 'کاملا موافقم', score: 4 }, { label: 'موافقم', score: 3 }, { label: 'خنثی', score: 2 }, { label: 'مخالفم', score: 1 }, { label: 'کاملا مخالفم', score: 0 }] }
      ],
      selectedPattern: {},
      questions: [],
      selectedQuestion: {},
      score: null,
      answers: [],
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'left', label: 'عنوان پاسخ', field: 'text' },
        { name: 'score', align: 'left', label: 'امتیاز پاسخ', field: 'score' },
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
        skip: 20
      },
      isLoading: false,
      updateLoading: false,
      search: '',
      answersOfSelectedQuestion: [],
      selectedAnswers: [],
      allAnswers: [],
      questionsForEditAnswer: []
    }
  },
  created () {
    if (this.$route.query) {
      this.questionId = Number(this.$route.query.questionId)
    }
    this.getCurrentQuestion()
    this.getTest()
    this.getAnswers()
    this.getQuestions()
    this.getQuestionOptions()
    this.getLocalStorage()
  },
  methods: {
    getCurrentQuestion () {
      axios.post(vars.api_base2 + '/FargoTest/Question/GetQuestion', {
        searchQuery: null,
        psychologyTestId: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {}
      }).then(response => {
        this.currentQuestion = response.data.items.filter(question => {
          return question.id === this.questionId
        })
      }).catch(error => {
        console.log(error)
      })
    },
    getTest () {
      axios.post(vars.api_base2 + '/FargoTest/PsychologyTest/GetTest', {
        searchQuery: null,
        tag1: null,
        tag2: null,
        take: null,
        skip: null,
        isExportFile: true,
        exportColumns: {}
      }).then(response => {
        this.tests = response.data.items
        // console.log(this.tests)
      }).catch(error => {
        console.log(error)
      })
    },
    getQuestions () {
      axios.post(vars.api_base2 + '/FargoTest/Question/GetQuestion', {
        searchQuery: null,
        psychologyTestId: null,
        take: null,
        skip: null,
        isExportFile: true,
      }).then(response => {
        this.questions = response.data.items.filter(question => {
          return question.psychology_test_id === this.selectedTest.id
        })
        // console.log(this.questions)
      }).catch(error => {
        console.log(error)
      })

      if (this.selectedTest.id) {
        axios.post(vars.api_base2 + '/FargoTest/Answer/GetAnswer', {
          psychologyTestId: this.selectedTest.id
        }).then(response => {
          this.allAnswers = response.data.items
          this.answersOfSelectedQuestion = response.data.items
          console.log(this.answersOfSelectedQuestion)
          for (let i = 0; i < this.answersOfSelectedQuestion.length; i++) {
            this.answersOfSelectedQuestion[i].label = this.answersOfSelectedQuestion[i].text
            this.answersOfSelectedQuestion[i].value = this.answersOfSelectedQuestion[i].id
          }
        }).catch(error => {
          console.log(error)
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
      if (this.answerTemplate === 0 || (this.answerTemplate === 1 &&
        Object.keys(this.selectedPattern).length === 0)) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا الگوی پاسخ را انتخاب کنید.'
        })
        this.isLoading = false
        return false
      }
      if (this.answerTemplate === 2 && this.answerText === '') {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا متن پاسخ را وارد کنید.'
        })
        this.isLoading = false
        return false
      }
      if (this.answerTemplate === 2 && this.score === null) {
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
          axios.post(vars.api_base2 + '/FargoTest/Answer/CreateAnswer', {
            questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
            text: answer[0].text,
            score: answer[0].score
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
            } else {
              this.isLoading = false
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[0].persianDescription
              })
            }
          }).catch(error => {
            console.log(error)
            this.isLoading = false
            this.$q.notify({
              type: 'negative',
              message: 'مشکلی پیش آمد.'
            })
          })
        }
        return true
      }
      if (this.answerTemplate === 2) {
        axios.post(vars.api_base2 + '/FargoTest/Answer/CreateAnswer', {
          questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
          text: this.answerText,
          score: Number(this.score)
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
          } else {
            this.isLoading = false
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[0].persianDescription
            })
          }
        }).catch(error => {
          console.log(error)
          this.isLoading = false
          this.$q.notify({
            type: 'negative',
            message: 'مشکلی پیش آمد.'
          })
        })
      } else if (this.answerTemplate === 1) {
        for (let i = 0; i < this.selectedPattern.value.value; i++) {
          axios.post(vars.api_base2 + '/FargoTest/Answer/CreateAnswer', {
            questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
            text: this.selectedPattern.value.options[i].label,
            score: this.selectedPattern.value.options[i].score
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
            } else {
              this.isLoading = false
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[0].persianDescription
              })
            }
          }).catch(error => {
            console.log(error)
            this.isLoading = false
            this.$q.notify({
              type: 'negative',
              message: 'مشکلی پیش آمد.'
            })
          })
        }
      }
    },
    getAnswers (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/FargoTest/Answer/GetAnswer', {
        searchQuery: null,
        questionId: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
        exportColumns: {},
        score: null
      }).then(response => {
        this.pagination.rowsNumber = response.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        if (!this.questionId) {
          this.answers = response.data.items
        } else {
          this.answers = response.data.items.filter(answer => {
            return answer.question_id === Number(this.$route.query.questionId)
          })
        }
      }).catch(error => {
        console.log(error)
      }).then(() => {
        this.loading = false
      })
    },
    getQuestionOptions () {
      axios.post(vars.api_base2 + '/FargoTest/Question/GetQuestion', {
        searchQuery: null,
        psychologyTestId: null,
        take: null,
        skip: null,
        isExportFile: true,
        exportColumns: {}
      }).then(response => {
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
      }).catch(error => {
        console.log(error)
      })
    },
    changeQuestion () {
      // console.log(this.selectQuestionToShow)
      axios.post(vars.api_base2 + '/FargoTest/Answer/GetAnswer', {
        searchQuery: null,
        questionId: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {},
        score: null
      }).then(response => {
        if (this.selectQuestionToShow.id === 0) {
          this.answers = response.data.items
        } else {
          this.answers = response.data.items.filter(answer => {
            return answer.question_id === this.selectQuestionToShow.id
          })
        }
      })
    },
    saveTemplate () {
      localStorage.setItem('answer-template', this.answerTemplate)
    },
    savePattern () {
      localStorage.setItem('answer-pattern', this.selectedPattern.value.value)
    },
    getLocalStorage () {
      if (localStorage.getItem('answer-pattern')) {
        this.selectedPattern.value = Object.assign({}, this.answerPatterns.filter(pattern => {
          return pattern.value === Number(localStorage.getItem('answer-pattern'))
        }))[0]
      }
      if (localStorage.getItem('answer-template')) {
        this.answerTemplate = Number(localStorage.getItem('answer-template'))
      }
    },
    deleteAnswer (answer) {
      axios.delete(vars.api_base2 + `/FargoTest/Answer/DeleteAnswer?id_=${answer.id}`).then(response => {
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
      console.log(this.selectedAnswerToEdit)
      this.getQuestionsForEdit()
    },
    editAnswer () {
      this.updateLoading = true
      if (this.selectedAnswerToEdit.text === '' || this.selectedAnswerToEdit.score === null) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد نمایید.'
        })
      } else {
        axios.put(vars.api_base2 + '/FargoTest/Answer/UpdateAnswer', {
          id: this.selectedAnswerToEdit.id,
          text: this.selectedAnswerToEdit.text,
          score: Number(this.selectedAnswerToEdit.score),
          questionId: this.selectedAnswerToEdit.question_id
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
      axios.post(vars.api_base2 + '/FargoTest/Answer/GetAnswer', {
        searchQuery: this.search,
        questionId: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {},
        score: null
      }).then(response => {
        this.answers = response.data.items
      }).catch(error => {
        console.log(error)
      })
    },
    getQuestionsForEdit() {
      axios.post(vars.api_base2 + '/FargoTest/Question/GetQuestion', {
        questionId: this.selectedAnswerToEdit.question_id
      }).then(response => {
        this.questionsForEditAnswer = response.data.items
        console.log(this.questionsForEditAnswer)
      }).catch(error => {
        console.log(error)
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
