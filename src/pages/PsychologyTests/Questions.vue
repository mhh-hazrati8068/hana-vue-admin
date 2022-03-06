<template>
  <div class="questions-container">
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
        rowsPerPage: 20,
        rowsNumber: 0
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
      selectedQuestionToEdit: {},
      createDialog: false,
      loading: false,
      qBody: {
        take: 20,
        skip: 0
      },
      isLoading: false,
      updateLoading: false,
      search: ''
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
      axios.post(vars.api_base2 + '/Question/GetQuestion', {
        searchQuery: null,
        psychologyTestId: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
        exportColumns: {}
      }).then(response => {
        this.pagination.rowsNumber = response.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        this.questions = response.data.items
        if (this.testId !== null) {
          this.questions = this.questions.filter(question => {
            return question.psychologytestid === this.testId
          })
        }
        // console.log(this.questions)
      }).catch(error => {
        console.log(error)
      }).then(() => {
        this.loading = false
      })
    },
    getTest () {
      axios.post(vars.api_base2 + '/PsychologyTest/GetTest', {
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
      }).catch(error => {
        console.log(error)
      })
    },
    setQuestion () {
      // console.log(this.questionData)
      this.isLoading = true
      if (this.questionData.text !== '' && this.questionData.psychologyTestId !== null) {
        axios.post(vars.api_base2 + '/Question/CreateQuestion', this.questionData).then(response => {
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
      axios.post(vars.api_base2 + '/Question/GetQuestion', {
        searchQuery: null,
        psychologyTestId: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {}
      }).then(response => {
        if (this.selectedTest.id === 0) {
          this.questions = response.data.items
        } else {
          this.questions = response.data.items.filter(question => {
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
      this.updateLoading = true
      if (this.selectedQuestionToEdit.text !== '') {
        axios.put(vars.api_base2 + '/Question/UpdateQuestion', this.selectedQuestionToEdit).then(response => {
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
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[0].persianDescription
            })
            this.updateLoading = false
          }
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            message: 'مشکلی پیش آمد.'
          })
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
      const payload = { id: questionId }
      axios.delete(vars.api_base2 + '/Question/DeleteQuestion', { data: payload }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'سوال حذف شد.'
          })
          this.getQuestions()
        } else {
          this.$q.notify({
            type: 'negative',
            message: response.data.exceptions[0].persianDescription
          })
        }
      }).catch(error => {
        console.log(error)
        this.$q.notify({
          type: 'negative',
          message: 'مشکلی پیش آمد.'
        })
      })
    },
    getSearchItems () {
      axios.post(vars.api_base2 + '/Question/GetQuestion', {
        searchQuery: this.search,
        take: null,
        skip: null,
        psychologyTestId: null,
        isExportFile: false,
        exportColumns: {}
      }).then(response => {
        this.questions = response.data.items
      }).catch(error => {
        console.log(error)
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
