<template>
  <div class="tests-container">
    <div class="row">
      <div class="col-12">
        <span class="title">افزودن تست</span>
      </div>
      <div class="col-12">
        <div class="create-test-container">
          <div class="row">
            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model="testData.text"
                label="عنوان تست"
                class="q-mt-sm"
                required
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model="testData.tag1"
                label="تگ تست"
                class="q-mt-sm"
                required
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model="testData.tag2"
                label="تگ تست"
                class="q-mt-sm"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-file
                dense
                outlined
                v-model="testData.img"
                label="تصویر تست"
                class="q-mt-sm"
                readonly
              />
            </div>
            <div class="col-12 q-mt-lg">
              <span>توضیحات تست</span>
              <q-input
                dense
                outlined
                v-model="testData.description"
                placeholder="توضیحات تست را وارد نمایید..."
                type="textarea"
                class="q-mt-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 q-mt-md flex justify-end">
        <q-btn
          dense
          unelevated
          label="ثبت"
          color="primary"
          style="width: 15%"
          @click="setTest"
        />
      </div>
      <div class="col-12">
        <span class="title q-mt-xl">تست&zwnj;های موجود</span>
      </div>
      <div class="col-12">
        <div class="tests-wrapper">
          <q-table
            :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
            :columns="columns"
            :rows="tests"
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
                    v-if="col.field === 'description'"
                    class="description"
                    @click="showDescriptionDialog(col.value)"
                  >
                    {{ col.value }}</span>
                  <span
                    v-else
                    :class="{ 'row-numbers': col.field === 'counter' }"
                    @click="goToQuestions(props.row.id)"
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
                    @click="deleteTest(props.row.id)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </div>
  <q-dialog v-model="showDescription">
    <q-card>
      <q-card-section class="row items-center">
        <div style="font-size: 1.1rem; margin-left: 2rem">توضیحات تست</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>{{ descriptionText }}</q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش تست</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <div class="create-test-container q-mt-md">
              <div class="row">
                <div class="col-12">
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.text"
                    label="عنوان تست"
                    class="q-mt-sm"
                    required
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.tag1"
                    label="تگ تست"
                    class="q-mt-sm q-mr-sm"
                    required
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.tag2"
                    label="تگ تست"
                    class="q-mt-sm q-ml-sm"
                  />
                </div>
                <div class="col-12">
                  <q-file
                    dense
                    outlined
                    v-model="selectedTestToEdit.img"
                    label="تصویر تست"
                    class="q-mt-sm"
                    readonly
                  />
                </div>
                <div class="col-12 q-mt-lg">
                  <span>توضیحات تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.description"
                    placeholder="توضیحات تست را وارد نمایید..."
                    type="textarea"
                    class="q-mt-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 q-mt-md flex justify-end">
            <q-btn
              dense
              unelevated
              label="ثبت"
              color="primary"
              style="width: 15%"
              @click="updateTest"
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
  name: 'Tests',
  data () {
    return {
      tests: [],
      testData: {
        text: '',
        tag1: '',
        tag2: null,
        img: '',
        description: ''
      },
      columns: [
        { name: 'counter', align: 'center', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'center', label: 'عنوان تست', field: 'text' },
        { name: 'description', align: 'center', label: 'توضیحات', field: 'description' },
        { name: 'tag1', align: 'center', label: 'تگ تست', field: 'tag1' },
        { name: 'tag2', align: 'center', label: 'تگ تست', field: 'tag2' },
        { name: 'img', align: 'center', label: 'تصویر تست', field: 'img' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      showDescription: false,
      descriptionText: '',
      editDialog: false,
      selectedTestToEdit: {},
      deleteData: {
        id: null
      }
    }
  },
  created () {
    this.getTest()
  },
  methods: {
    setTest () {
      // console.log(this.testData)
      if (this.testData.text === '' || this.testData.tag1 === '') {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
      } else {
        axios.post(vars.api_base + '/api/PsychologicalAssay/CreatePsychologyTest', this.testData).then(response => {
          // console.log(response)
          this.$q.notify({
            type: 'positive',
            message: 'تست جدید اضافه شد.'
          })
          this.testData = {
            img: '',
            tag1: '',
            tag2: null,
            text: '',
            description: ''
          }
          this.getTest()
        }).catch(error => {
          console.log(error)
        })
      }
    },
    getTest () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetPsychologyTest').then(response => {
        this.tests = response.data.item
      }).catch(error => {
        console.log(error)
      })
    },
    goToQuestions (testId) {
      // console.log(testId)
      this.$router.push({
        name: 'questions',
        query: { testId: testId }
      })
    },
    showDescriptionDialog (description) {
      this.showDescription = !this.showDescription
      this.descriptionText = description
    },
    openEditDialog (test) {
      this.editDialog = !this.editDialog
      this.selectedTestToEdit = test
      // console.log(this.selectedTestToEdit)
    },
    updateTest () {
      if (this.selectedTestToEdit.text === '' || this.selectedTestToEdit.tag1 === '') {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
      } else {
        axios.post(vars.api_base + '/api/PsychologicalAssay/UpdatePsychologyTest', this.selectedTestToEdit).then(response => {
          // console.log(response)
          this.$q.notify({
            type: 'positive',
            message: 'تست با موفقیت ویرایش شد.'
          })
          this.getTest()
          this.editDialog = !this.editDialog
        }).catch(error => {
          console.log(error)
        })
      }
    },
    deleteTest (testId) {
      const payload = { id: testId }
      axios.post(vars.api_base + '/api/PsychologicalAssay/DeletePsychologyTest', payload).then(response => {
        this.$q.notify({
          type: 'info',
          message: 'تست حذف شد.'
        })
        this.getTest()
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
.q-page-container {
  //overflow: hidden;
}
.tests-container {
  padding: 1rem;
  overflow: hidden;
  .title {
    font-size: 1.1rem;
    display: inline-block;
  }
  .create-test-container {
    margin-top: 2rem;
    @media (min-width: 1024px) {
      .q-input {
        margin-right: 1rem;
      }
    }
  }
  .tests-wrapper {
    margin-top: 2rem;

    .description {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 50ch;
    }
  }
}
</style>
