<template>
  <div class="tags-container">
    <q-input
      v-model="search"
      outlined
      dense
      placeholder="جستجو کنید..."
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="title flex justify-between" style="align-items: center">
      <span>تگ&zwnj;های موجود</span>
      <q-select
        dense
        outlined
        v-model="selectedCategory.id"
        :options="selectOptions"
        :option-value="'id'"
        :option-label="'text'"
        label="انتخاب دسته&zwnj;بندی"
        emit-value
        map-options
        class="q-ml-md"
        style="min-width: 150px"
        @update:model-value="changeTag"
      />
    </div>
    <div class="tags-wrapper">
      <q-table
        :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
        :columns="columns"
        :rows="tags"
        v-model:pagination="pagination"
        :loading="loading"
        @request="getTags"
        :rows-per-page-options="[10,20,30,40,50]"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              <span
                v-if="col.field !== 'counter' && col.field !== 'img'"
                style="cursor: default"
              >
                {{ col.value }}
              </span>
              <span
                v-if="col.field === 'counter'"
                :class="{ 'row-numbers': col.field === 'counter' }"
                style="cursor: default"
              >
                    {{ col.value }}
              </span>
              <div
                v-if="col.field === 'img'"
                v-html="col.value"
                style="max-width: 50px; margin: auto"
              ></div>
              <q-btn
                v-if="col.field === 'testsBtn'"
                unelevated
                dense
                label="مشاهده تست&zwnj;ها"
                class="text-primary"
                style="font-size: .75rem"
                @click="goToTests(props.row.id)"
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
                @click="deleteTag(props.row.id)"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="flex justify-end">
      <q-btn
        unelevated
        dense
        label="افزودن تگ"
        icon-right="add"
        color="primary"
        class="btn q-py-sm q-mt-md"
        @click="createDialog = !createDialog"
      />
    </div>
  </div>

  <q-dialog v-model="createDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">افزودن تگ</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <span class="label">دسته&zwnj;بندی</span>
            <q-select
              dense
              outlined
              v-model="tagData.categoryId"
              :options="categories"
              :option-value="'id'"
              :option-label="'text'"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">عنوان</span>
            <q-input
              outlined
              dense
              v-model="tagData.text"
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">تصویر (محتوای تصویر svg را قرار دهید)</span>
            <q-input
              outlined
              dense
              v-model="tagData.img"
            />
            <!--            <q-file
                          outlined
                          dense
                          v-model="categoryData.img"
                          accept=".svg"
                        />-->
          </div>
          <div class="col-12">
            <q-btn
              unelevated
              dense
              color="primary"
              label="ثبت"
              class="submit-btn q-mt-lg"
              @click="setTag"
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
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش تگ</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <span class="label">دسته&zwnj;بندی</span>
            <q-select
              dense
              outlined
              v-model="selectedTagToEdit.category_id"
              :options="categories"
              :option-value="'id'"
              :option-label="'text'"
              label="انتخاب دسته بندی"
              emit-value
              map-options
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">عنوان</span>
            <q-input
              outlined
              dense
              v-model="selectedTagToEdit.text"
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">تصویر (محتوای تصویر svg را قرار دهید)</span>
            <div
              v-html="selectedTagToEdit.img"
              style="max-width: 75px"
            ></div>
            <q-input
              outlined
              dense
              v-model="selectedTagToEdit.img"
            />
            <!--            <q-file
                          outlined
                          dense
                          v-model="categoryData.img"
                          accept=".svg"
                        />-->
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">وضعیت</span>
            <div>
              <span v-if="selectedTagToEdit.is_active">فعال</span>
              <span v-else>غیرفعال</span>
              <q-checkbox
                dense
                v-model="selectedTagToEdit.is_active"
                class="q-ml-sm"
              />
            </div>
          </div>
          <div class="col-12">
            <q-btn
              unelevated
              dense
              color="primary"
              label="ثبت"
              class="submit-btn q-mt-lg"
              @click="updateTag"
            >
              <q-inner-loading
                :showing="isUpdating"
              />
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import * as axios from "axios";
import vars from "src/vars";
import { useMeta } from 'quasar'

const metaData = {
  title: 'تست\u200Cهای روانشناسی - تگ\u200Cها'
}

export default defineComponent({
  name: 'Tags',
  setup() {
    useMeta(metaData)
  },
  data() {
    return {
      search: '',
      categories: [],
      columns: [
        { name: 'counter', align: 'center', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'center', label: 'عنوان', field: 'text' },
        { name: 'categoryLabel', align: 'center', label: 'دسته\u200Cبندی', field: 'categoryLabel' },
        { name: 'img', align: 'center', label: 'تصویر', field: 'img' },
        { name: 'testsBtn', align: 'center', label: '', field: 'testsBtn' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      tags: [],
      loading: false,
      qBody: {
        take: 20,
        skip: 0
      },
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      createDialog: false,
      tagData: {
        text: '',
        img: '',
        categoryId: null,
        isActive: true
      },
      isLoading: false,
      editDialog: false,
      selectedTagToEdit: {},
      isUpdating: false,
      selectedCategory: {},
      selectOptions: [],
      categoryId: null
    }
  },
  methods: {
    getCategories() {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetCategory', {
        SearchQuery: null,
        IsExportFile: true
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(res => {
        if (res.data.isSuccess) {
          this.categories = res.data.items
          this.selectOptions = [{
            id: 0,
            text: 'همه'
          }, ...res.data.items
          ]
          if (this.categoryId !== null) {
            this.selectedCategory.id = this.categories.find(category => category.id === this.categoryId).id
          } else {
            this.selectedCategory.id = this.selectOptions.find(category => category.id === 0).id
          }
        } else {
          for (let i = 0; i < res.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: res.data.exceptions[i].persianDescription
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
    getTags(reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetTag', {
        SearchQuery: null,
        Take: this.qBody.take,
        Skip: this.qBody.skip,
        IsExportFile: false,
        CategoryId: this.categoryId ? this.categoryId : null
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(res => {
        if (res.data.isSuccess) {
          this.pagination.rowsNumber = res.data.count
          this.pagination.page = reqProps?.pagination.page ?? 1
          this.tags = res.data.items
          for (let i = 0; i < this.tags.length; i++) {
            for (let j = 0; j < this.categories.length; j++) {
              if (this.tags[i].category_id === this.categories[j].id) {
                this.tags[i].categoryLabel = this.categories[j].text
              }
            }
          }
          if (this.categoryId !== null) {
            this.tags = this.tags.filter(tag => {
              return tag.category_id === this.categoryId
            })
          }
        } else {
          for (let i = 0; i < res.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: res.data.exceptions[i].persianDescription
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
      }).then(() => {
        this.loading = false
      })
    },
    setTag() {
      this.isLoading = true
      if (!this.tagData.text || !this.tagData.img || !this.tagData.categoryId) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.isLoading = false
      } else {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/CreateTag', this.tagData,{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(res => {
          if (res.data.isSuccess) {
            this.createDialog = false
            this.tagData = {
              text: '',
              img: '',
              categoryId: null,
              isActive: true
            }
            this.$q.notify({
              type: 'positive',
              message: 'تگ با موفقیت اضافه شد.'
            })
            this.isLoading = false
            this.getTags()
          } else {
            for (let i = 0; i < res.data.exceptions.length; i++) {
              this.$q.notify({
                type: 'negative',
                message: res.data.exceptions[i].persianDescription
              })
            }
            this.isLoading = false
          }
        }).catch(err => {
          console.log(err)
          this.isLoading = false
          for (let i = 0; i < err.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: err.response.data.exceptions[i].persianDescription
            })
          }
        })
      }
    },
    openEditDialog(tag) {
      this.editDialog = !this.editDialog
      this.selectedTagToEdit = tag
    },
    deleteTag(tagId) {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/DeleteTag', {
        Id_: tagId
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(res => {
        if (res.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'تگ با موفقیت حذف شد.'
          })
          this.getTags()
        } else {
          for (let i = 0; i < res.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: res.data.exceptions[i].persianDescription
            })
          }
          this.isLoading = false
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
    updateTag() {
      this.isUpdating = true
      if (!this.selectedTagToEdit.text || !this.selectedTagToEdit.img || !this.selectedTagToEdit.category_id) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا همه مقادیر را وارد کنید.'
        })
        this.isUpdating = false
      } else {
        axios.post(vars.api_base2 + '/api/PsychologicalAssay/UpdateTag', {
          text: this.selectedTagToEdit.text,
          img: this.selectedTagToEdit.img,
          categoryId: this.selectedTagToEdit.category_id,
          id: this.selectedTagToEdit.id,
          isActive: this.selectedTagToEdit.is_active
        },{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(res => {
          if (res.data.isSuccess) {
            this.editDialog = false
            this.getTags()
            this.$q.notify({
              type: 'positive',
              message: 'تگ با موفقیت برورسانی شد.'
            })
            this.isUpdating = false
          } else {
            for (let i = 0; i < res.data.exceptions.length; i++) {
              this.$q.notify({
                type: 'negative',
                message: res.data.exceptions[i].persianDescription
              })
            }
            this.isUpdating = false
          }
        }).catch(err => {
          console.log(err)
          for (let i = 0; i < err.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: err.response.data.exceptions[i].persianDescription
            })
          }
          this.isUpdating = false
        })
      }
    },
    changeTag() {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetTag', {
        SearchQuery: null,
        // categoryId: this.selectedCategory.id !== 0 ? this.selectedCategory.id : null,
        IsExportFile: true,
      },{
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.isSuccess) {
          if (this.selectedCategory.id === 0) {
            this.tags = response.data.items
          } else {
            this.tags = response.data.items.filter(tag => {
              return tag.category_id === this.selectedCategory.id
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
    goToTests(tagId) {
      this.$router.push({
        name: 'tests',
        query: { tagId }
      })
    }
  },
  created() {
    if (this.$route.query.categoryId) {
      this.categoryId = Number(this.$route.query.categoryId)
    }
    this.getCategories()
    this.getTags()
  }
})
</script>

<style lang="scss" scoped>
.tags-container {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    margin-top: 2rem;
  }

  .tags-wrapper {
    margin-top: 2rem;
  }
}
</style>
