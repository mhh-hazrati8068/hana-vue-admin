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
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="">
                    <span class="label">عنوان تست</span>
                    <q-input
                      dense
                      outlined
                      v-model="selectedTestToEdit.text"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="second-input">
                    <span class="label">تگ تست</span>
                    <q-select
                      dense
                      outlined
                      v-model="selectedTestToEdit.tag_id"
                      :options="tags"
                      :option-label="'text'"
                      :option-value="'id'"
                      emit-value
                      map-options
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="flex column">
                    <span class="label" style="opacity: 0">قیمت تست</span>
                    <q-checkbox
                      dense
                      outlined
                      v-model="selectedTestToEdit.being_monetary"
                      label="پولی"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="second-input">
                    <span class="label">قیمت تست</span>
                    <q-input
                      dense
                      outlined
                      v-model="selectedTestToEdit.cost"
                      :disable="!selectedTestToEdit.being_monetary"
                    />
                  </div>
                </div>
                <div class="col-12 q-mt-md">
                  <div class="">
                    <span class="label">تصویر تست (لینک تصویر آپلود شده را قرار دهید)</span>
                    <q-input
                      dense
                      outlined
                      v-model="selectedTestToEdit.img"
                    />
                  </div>
                </div>
                <div class="col-12 q-mt-md">
                  <span class="label">توضیحات تست</span>
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.description"
                    placeholder="توضیحات تست را وارد نمایید..."
                    type="textarea"
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
                  <div class="">
                    <span class="label">عنوان تست</span>
                    <q-input
                      dense
                      outlined
                      v-model="testData.text"
                      required
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="second-input">
                    <span class="label">تگ تست</span>
                    <q-select
                      dense
                      outlined
                      v-model="testData.tagId"
                      :options="tags"
                      :option-label="'text'"
                      :option-value="'id'"
                      emit-value
                      map-options
                      required
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="flex column">
                    <span class="label" style="opacity: 0">قیمت تست</span>
                    <q-checkbox
                      dense
                      outlined
                      v-model="testData.beingMonetary"
                      label="پولی"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="second-input">
                    <span class="label">قیمت تست</span>
                    <q-input
                      dense
                      outlined
                      v-model="testData.cost"
                      :disable="!testData.beingMonetary"
                    />
                  </div>
                </div>
                <div class="col-12 q-mt-md">
                  <div class="">
                    <span class="label">تصویر تست (لینک تصویر آپلود شده را قرار دهید)</span>
                    <q-input
                      dense
                      outlined
                      v-model="testData.img"
                    />
                  </div>
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
        img: '',
        description: '',
        cost: null,
        beingMonetary: false,
        tagId: null
      },
      columns: [
        { name: 'counter', align: 'center', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'center', label: 'عنوان تست', field: 'text' },
        // { name: 'description', align: 'center', label: 'توضیحات', field: 'description' },
        { name: 'tag', align: 'center', label: 'تگ تست', field: 'tag' },
        // { name: 'img', align: 'center', label: 'تصویر تست', field: 'img' },
        { name: 'detail', align: 'center', label: '', field: 'detail'},
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
      search: '',
      tags: []
    }
  },
  created () {
    this.getTest()
    this.getTags()
  },
  methods: {
    setTest () {
      // console.log(this.testData)
      this.isLoading = true
      if (!this.testData.text || !this.testData.tagId || !this.testData.img || !this.testData.description) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
        this.isLoading = false
      } else {
        axios.post(vars.api_base2 + '/FargoTest/PsychologyTest/CreateTest', this.testData).then(response => {
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
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[i].persianDescription
              })
            }
            this.isLoading = false
          }
        }).catch(error => {
          console.log(error)
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: error.response.data.exceptions[i].persianDescription
            })
          }
          this.isLoading = false
        })
      }
    },
    getTest (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/FargoTest/PsychologyTest/GetTest', {
        searchQuery: null,
        tagId: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
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
      if (!this.selectedTestToEdit.text || !this.selectedTestToEdit.tag_id || !this.selectedTestToEdit.img || !this.selectedTestToEdit.description) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد نمایید.'
        })
        this.updateLoading = false
      } else {
        axios.put(vars.api_base2 + '/FargoTest/PsychologyTest/UpdateTest', {
          text: this.selectedTestToEdit.text,
          img: this.selectedTestToEdit.img,
          description: this.selectedTestToEdit.description,
          cost: this.selectedTestToEdit.being_monetary ? Number(this.selectedTestToEdit.cost) : null,
          beingMonetary: this.selectedTestToEdit.being_monetary,
          id: this.selectedTestToEdit.id,
          tagId: this.selectedTestToEdit.tag_id
        }).then(response => {
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
    deleteTest (testId) {
      axios.delete(vars.api_base2 + `/FargoTest/PsychologyTest/DeleteTest?id_=${testId}`).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'تست با موفقیت حذف شد.'
          })
          this.getTest()
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
    },
    openDetailDialog(test) {},
    getTags() {
      axios.post(vars.api_base2 + '/FargoTest/Tag/GetTag', {
        searchQuery: null,
        take: null,
        skip: null,
        isExportFile: true,
        categoryId: null
      }).then(res => {
        this.tags = res.data.items
        for (let i = 0; i < this.tests.length; i++) {
          for (let j = 0; j < this.tags.length; j++) {
            if (this.tests[i].tag_id === this.tags[j].id) {
              this.tests[i].tag = this.tags[j].text
            }
          }
        }
        // console.log(this.tests)
      }).catch(err => {
        console.log(err)
      }).then(() => {
        this.loading = false
      })
    },
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
