<template>
  <div class="tests-container">
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
        <span class="title">تست&zwnj;های موجود</span>
      </div>
      <div class="col-12">
        <div class="tests-wrapper">
          <q-table
            :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
            :columns="columns"
            :rows="tests"
            v-model:pagination="pagination"
            :loading="loading"
            @request="getTest"
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
      <div class="col-12 flex justify-end">
        <q-btn
          unelevated
          dense
          label="افزودن تست"
          icon-right="add"
          color="primary"
          class="btn q-py-sm q-mt-md"
          @click="createDialog = !createDialog"
        />
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
                <div class="col-12 q-mt-md">
                  <span class="label">عنوان تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.text"
                    required
                  />
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <span class="label">تگ تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.tag1"
                    required
                  />
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <span class="label">تگ تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.tag2"
                    class="second-input"
                  />
                </div>
                <div class="col-12 q-mt-md">
                  <span class="label">تصویر تست</span>
                  <q-file
                    dense
                    outlined
                    v-model="selectedTestToEdit.img"
                    readonly
                  />
                </div>
                <div class="col-12 q-mt-lg q-mt-md">
                  <span class="label">توضیحات تست</span>
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
              class="submit-btn"
              @click="updateTest"
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
        <div class="text-h6">افزودن تست</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <div class="create-test-container">
              <div class="row">
                <div class="col-12 col-md-6 q-mt-md">
                  <span class="label">عنوان تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="testData.text"
                    required
                  />
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <span class="label">تگ تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="testData.tag1"
                    class="second-input"
                    required
                  />
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <span class="label">تگ تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="testData.tag2"
                  />
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <span class="label">تصویر تست</span>
                  <q-file
                    dense
                    outlined
                    v-model="testData.img"
                    class="second-input"
                    readonly
                  />
                </div>
                <div class="col-12 q-mt-md">
                  <span class="label">توضیحات تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="testData.description"
                    placeholder="توضیحات تست را وارد نمایید..."
                    type="textarea"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 q-mt-md flex justify-center">
            <q-btn
              dense
              unelevated
              label="ثبت تست"
              color="primary"
              class="submit-btn"
              @click="setTest"
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
        rowsPerPage: 20,
        rowsNumber: 0
      },
      showDescription: false,
      descriptionText: '',
      editDialog: false,
      selectedTestToEdit: {},
      deleteData: {
        id: null
      },
      createDialog: false,
      loading: false,
      qBody: {
        take: 20,
        skip:0
      },
      isLoading: false,
      updateLoading: false,
      search: ''
    }
  },
  created () {
    this.getTest()
  },
  methods: {
    setTest () {
      // console.log(this.testData)
      this.isLoading = true
      if (this.testData.text === '' || this.testData.tag1 === '') {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
      } else {
        axios.post(vars.api_base2 + '/PsychologyTest/CreateTest', this.testData).then(response => {
          // console.log(response)
          if (response.data.isSuccess) {
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
            this.createDialog = false
            this.isLoading = false
            this.getTest()
          } else {
            this.$q.notify({
              type: 'negative',
              message: response.data.exceptions[0].persianDescription
            })
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
    },
    getTest (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/PsychologyTest/GetTest', {
        searchQuery: null,
        tag1: null,
        tag2: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
        exportColumns: {}
      }).then(response => {
        this.pagination.rowsNumber = response.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        this.tests = response.data.items
      }).catch(error => {
        console.log(error)
      }).then(() => {
        this.loading = false
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
      this.updateLoading = true
      if (this.selectedTestToEdit.text === '' || this.selectedTestToEdit.tag1 === '') {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
      } else {
        axios.put(vars.api_base2 + '/PsychologyTest/UpdateTest', this.selectedTestToEdit).then(response => {
          // console.log(response)
          if (response.data.isSuccess) {
            this.$q.notify({
              type: 'positive',
              message: 'تست با موفقیت ویرایش شد.'
            })
            this.getTest()
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
        })
      }
    },
    deleteTest (testId) {
      const payload = { id: testId }
      axios.delete(vars.api_base2 + '/PsychologyTest/DeleteTest', { data: payload }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'تست حذف شد.'
          })
          this.getTest()
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
      axios.post(vars.api_base2 + '/PsychologyTest/GetTest', {
        searchQuery: this.search,
        tag1: null,
        tag2: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {}
      }).then(response => {
        this.tests = response.data.items
      }).catch(error => {
        console.log(error)
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
