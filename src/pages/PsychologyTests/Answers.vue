<template>
  <div class="answers-container">
    <div class="row">
      <div class="col-12">
        <span class="title">افزودن پاسخ</span>
      </div>
      <div class="col-12">
        <div class="create-answer-container">
          <div class="row">
            <div class="col-12 col-md-6" v-if="!this.$route.query.questionId || chooseQuestion">
              <div class="select-test-question">
                <q-select
                  dense
                  outlined
                  v-model="selectedTest.id"
                  :options="tests"
                  :option-value="'id'"
                  :option-label="'text'"
                  label="انتخاب تست"
                  emit-value
                  map-options
                  @update:model-value="getQuestions"
                />
              </div>
            </div>
            <div class="col-12 col-md-6" v-if="!this.$route.query.questionId || chooseQuestion">
              <div class="select-test-question">
                <q-select
                  dense
                  outlined
                  v-model="selectedQuestion.id"
                  :options="questions"
                  :option-value="'id'"
                  :option-label="'text'"
                  label="انتخاب سوال"
                  emit-value
                  map-options
                  class="q-ml-md"
                  :disable="Object.keys(selectedTest).length === 0"
                />
              </div>
            </div>
            <div class="col-12 col-md-4 q-mb-md q-mt-lg">
              <span>قالب پاسخ</span>
              <q-option-group
                :options="answerTemplateOptions"
                v-model="answerTemplate"
                class="q-mt-md flex justify-between"
                @update:model-value="saveTemplate"
              />
            </div>
            <div class="col-12">
              <q-select
                dense
                outlined
                label="الگو پاسخ"
                v-model="selectedPattern.value"
                :options="answerPatterns"
                v-if="answerTemplate === 1"
                class="q-mb-md"
                @update:model-value="savePattern"
              />
            </div>
            <div class="col-12">
              <q-input
                dense
                outlined
                label="متن پاسخ"
                v-model="answerText"
                v-if="answerTemplate === 2"
                class="q-mb-md"
              />
            </div>
            <div class="col-12 col-md-4" v-if="answerTemplate === 2">
              <span>امتیاز</span>
              <q-input
                dense
                outlined
                v-model="score"
                type="number"
                min="0"
                class="q-mt-md"
              />
            </div>
            <div
              class="col-12 q-mt-md flex"
              :class="{ 'justify-between': this.$route.query.questionId,
               'justify-end': !this.$route.query.questionId }"
            >
              <q-checkbox
                v-if="this.$route.query.questionId"
                v-model="chooseQuestion"
                label="انتخاب سوال&zwnj;های دیگر"
              />
              <q-btn
                dense
                unelevated
                label="ثبت"
                color="primary"
                style="width: 15%"
                @click="setAnswer"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 q-mt-xl">
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
                    @click="deleteAnswer(props.row)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
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
          <div class="col-12">
            <q-input
              dense
              outlined
              label="متن پاسخ"
              v-model="selectedAnswerToEdit.text"
              class="q-mb-md"
            />
          </div>
          <div class="col-12">
            <span>امتیاز</span>
            <q-input
              dense
              outlined
              v-model="selectedAnswerToEdit.score"
              type="number"
              min="0"
              class="q-mt-md"
            />
          </div>
          <div class="col-12 q-mt-md flex justify-end">
            <q-btn
              dense
              unelevated
              label="ثبت"
              color="primary"
              style="width: 25%"
              @click="editAnswer"
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
        { label: 'پنج گزینه\u200Cای', value: 5, options: [{ label: 'کاملا موافقم', score: 4 }, { label: 'موافقم', score: 3 }, { label: 'خنثی', score: 2 }, { label: 'مخافم', score: 1 }, { label: 'کاملا مخالفم', score: 0 }] }
      ],
      selectedPattern: {},
      questions: [],
      selectedQuestion: {},
      score: null,
      answers: [],
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'left', label: 'عنوان سوال', field: 'text' },
        { name: 'score', align: 'left', label: 'امتیاز سوال', field: 'score' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      questionOptions: [],
      selectQuestionToShow: {},
      chooseQuestion: false,
      editDialog: false,
      selectedAnswerToEdit: {}
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
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetQuestion').then(response => {
        this.currentQuestion = response.data.item.filter(question => {
          return question.id === this.questionId
        })
      }).catch(error => {
        console.log(error)
      })
    },
    getTest () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetPsychologyTest').then(response => {
        this.tests = response.data.item
        // console.log(this.tests)
      }).catch(error => {
        console.log(error)
      })
    },
    getQuestions () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetQuestion').then(response => {
        this.questions = response.data.item.filter(question => {
          return question.psychologytestid === this.selectedTest.id
        })
        // console.log(this.questions)
      }).catch(error => {
        console.log(error)
      })
    },
    setAnswer () {
      if (!this.questionId) {
        if (Object.keys(this.selectedQuestion).length === 0) {
          this.$q.notify({
            type: 'negative',
            message: 'لطفا سوال را انتخاب کنید.'
          })
        }
      }
      if (this.answerTemplate === 0 || (this.answerTemplate === 1 &&
        Object.keys(this.selectedPattern).length === 0)) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا الگوی پاسخ را انتخاب کنید.'
        })
      }
      if (this.answerTemplate === 2 && this.answerText === '') {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا متن پاسخ را وارد کنید.'
        })
      }
      if (this.answerTemplate === 2 && this.score === null) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا امتیاز پاسخ را وارد کنید.'
        })
      }
      // console.log(this.selectedPattern.value.label)
      // console.log(this.selectedQuestion.id)
      if (this.answerTemplate === 2) {
        axios.post(vars.api_base + '/api/PsychologicalAssay/CreateAnswer', {
          questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
          text: this.answerText,
          score: Number(this.score)
        }).then(response => {
          this.$q.notify({
            type: 'positive',
            message: 'پاسخ جدید اضافه شد.'
          })
          this.answerText = ''
          this.score = null
          // this.answerTemplate = 0
          this.selectedTest = {}
          this.selectedQuestion = {}
          this.getAnswers()
        }).catch(error => {
          console.log(error)
        })
      } else if (this.answerTemplate === 1) {
        for (let i = 0; i < this.selectedPattern.value.value; i++) {
          axios.post(vars.api_base + '/api/PsychologicalAssay/CreateAnswer', {
            questionId: this.questionId ? this.questionId : this.selectedQuestion.id,
            text: this.selectedPattern.value.options[i].label,
            score: this.selectedPattern.value.options[i].score
          }).then(response => {
            // console.log(response)
            this.$q.notify({
              type: 'positive',
              message: 'پاسخ جدید اضافه شد.'
            })
            this.selectedTest = {}
            this.selectedQuestion = {}
            this.selectedPattern = {}
            this.getAnswers()
          }).catch(error => {
            console.log(error)
          })
        }
      }
    },
    getAnswers () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetAnswer').then(response => {
        if (!this.questionId) {
          this.answers = response.data.item
        } else {
          this.answers = response.data.item.filter(answer => {
            return answer.questionid === Number(this.$route.query.questionId)
          })
        }
      }).catch(error => {
        console.log(error)
      })
    },
    getQuestionOptions () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetQuestion').then(response => {
        this.questionOptions = [{
          id: 0,
          text: 'همه'
        }, ...response.data.item
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
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetAnswer').then(response => {
        if (this.selectQuestionToShow.id === 0) {
          this.answers = response.data.item
        } else {
          this.answers = response.data.item.filter(answer => {
            return answer.questionid === this.selectQuestionToShow.id
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
      const payload = {
        id: answer.id,
        questionId: null
      }
      axios.post(vars.api_base + '/api/PsychologicalAssay/DeleteAnswer', payload).then(response => {
        this.$q.notify({
          type: 'info',
          message: 'پاسخ حذف شد.'
        })
        this.getAnswers()
      }).catch(error => {
        console.log(error)
        this.$q.notify({
          type: 'negative',
          message: 'مشکلی پیش آمد.'
        })
      })
    },
    openEditDialog (answer) {
      this.editDialog = !this.editDialog
      this.selectedAnswerToEdit = answer
    },
    editAnswer () {
      if (this.selectedAnswerToEdit.text === '' || this.selectedAnswerToEdit.score === null) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا موارد ضروری را وارد نمایید.'
        })
      } else {
        axios.post(vars.api_base + '/api/PsychologicalAssay/UpdateAnswer', {
          id: this.selectedAnswerToEdit.id,
          text: this.selectedAnswerToEdit.text,
          score: Number(this.selectedAnswerToEdit.score)
        }).then(response => {
          this.$q.notify({
            type: 'positive',
            message: 'پاسخ با موفقیت ویرایش شد.'
          })
          this.getAnswers()
          this.editDialog = !this.editDialog
        }).catch(error => {
          console.log(error)
        })
      }
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
