<template>
  <div class="questions-container">
    <div class="row">
      <div class="col-12">
        <span class="title">افزودن سوال</span>
      </div>
      <div class="col-12">
        <div class="create-question-container">
          <div class="row">
            <div class="col-12 col-md-8">
              <q-input
                dense
                outlined
                v-model="questionData.text"
                label="متن سوال"
                autogrow
                class="q-mt-sm"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                dense
                outlined
                v-model="questionData.psychologyTestId"
                :options="tests"
                :option-value="'id'"
                :option-label="'text'"
                label="انتخاب تست"
                emit-value
                map-options
                class="q-mt-sm"
              />
            </div>
            <div class="col-12 q-mt-md flex justify-end">
              <q-btn
                dense
                unelevated
                label="ثبت"
                color="primary"
                style="width: 15%"
                @click="setQuestion"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 q-mt-xl">
        <div class="flex justify-between" style="align-items: center">
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
                    @click="goToAnswers(props.row.id)"
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
                    @click="deleteQuestion(props.row.id)"
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
        <div class="text-h6">ویرایش سوال</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <q-input
              dense
              outlined
              v-model="selectedQuestionToEdit.text"
              label="متن سوال"
              autogrow
              class="q-mt-sm"
            />
          </div>
          <div class="col-12 q-mt-md flex justify-end">
            <q-btn
              dense
              unelevated
              label="ثبت"
              color="primary"
              style="width: 25%"
              @click="updateQuestion"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import vars from '../../vars'
import * as axios from 'axios'

export default defineComponent({
  name: 'Questions',
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
        rowsPerPage: 0
      },
      columns: [
        { name: 'counter', align: 'left', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'left', label: 'عنوان سوال', field: 'text' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      selectedTest: {},
      selectOptions: [],
      editDialog: false,
      selectedQuestionToEdit: {}
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
    getQuestions () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetQuestion').then(response => {
        this.questions = response.data.item
        if (this.testId !== null) {
          this.questions = this.questions.filter(question => {
            return question.psychologytestid === this.testId
          })
        }
        // console.log(this.questions)
      }).catch(error => {
        console.log(error)
      })
    },
    getTest () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetPsychologyTest').then(response => {
        this.tests = response.data.item
        // console.log(this.tests)
        this.selectOptions = [{
          id: 0,
          text: 'همه'
        }, ...response.data.item
        ]
        if (this.testId !== null) {
          this.selectedTest.id = this.tests.find(test => test.id === this.testId).id
        } else {
          this.selectedTest.id = this.selectOptions.find(test => test.id === 0).id
        }
        // console.log(this.selectedTest)
      }).catch(error => {
        console.log(error)
      })
    },
    setQuestion () {
      // console.log(this.questionData)
      if (this.questionData.text !== '' && this.questionData.psychologyTestId !== null) {
        axios.post(vars.api_base + '/api/PsychologicalAssay/CreateQuestion', this.questionData).then(response => {
          // console.log(response)
          this.$q.notify({
            type: 'positive',
            message: 'سوال جدید اضافه شد.'
          })
          this.getQuestions()
          this.questionData = {
            psychologyTestId: null,
            text: ''
          }
        }).catch(error => {
          console.log(error)
        })
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
      }
    },
    changeQuestions () {
      // console.log(this.selectedTest)
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetQuestion').then(response => {
        if (this.selectedTest.id === 0) {
          this.questions = response.data.item
        } else {
          this.questions = response.data.item.filter(question => {
            return question.psychologytestid === this.selectedTest.id
          })
        }
        // console.log(this.questions)
      }).catch(error => {
        console.log(error)
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
      if (this.selectedQuestionToEdit.text !== '') {
        axios.post(vars.api_base + '/api/PsychologicalAssay/UpdateQuestion', this.selectedQuestionToEdit).then(response => {
          // console.log(response)
          this.$q.notify({
            type: 'positive',
            message: 'سوال با موفقیت ویرایش شد.'
          })
          this.getQuestions()
          this.editDialog = !this.editDialog
        }).catch(error => {
          console.log(error)
        })
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
      }
    },
    deleteQuestion (questionId) {
      const payload = { id: questionId }
      axios.post(vars.api_base + '/api/PsychologicalAssay/DeleteQuestion', payload).then(response => {
        this.$q.notify({
          type: 'info',
          message: 'سوال حذف شد.'
        })
        this.getQuestions()
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
