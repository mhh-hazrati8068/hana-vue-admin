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
    <div class="title">
      <span>تگ&zwnj;های موجود</span>
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
                v-if="col.field !== 'counter'"
                style="cursor: default"
              >
                {{ col.value }}
              </span>
              <span
                v-else
                :class="{ 'row-numbers': col.field === 'counter' }"
                style="cursor: default"
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

export default defineComponent({
  name: 'Tags',
  data() {
    return {
      search: '',
      categories: [],
      columns: [
        { name: 'counter', align: 'center', label: 'ردیف', field: 'counter' },
        { name: 'text', align: 'center', label: 'عنوان', field: 'text' },
        { name: 'categoryLabel', align: 'center', label: 'دسته\u200Cبندی', field: 'categoryLabel' },
        { name: 'img', align: 'center', label: 'تصویر', field: 'img' },
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
        categoryId: null
      },
      isLoading: false,
      editDialog: false,
      selectedTagToEdit: {},
      isUpdating: false
    }
  },
  methods: {
    getCategories() {
      axios.post(vars.api_base2 + '/FargoTest/Category/GetCategory', {
        searchQuery: null,
        take: null,
        skip: null,
        isExportFile: true
      }).then(res => {
        this.categories = res.data.items
      }).catch(err => {
        console.log(err)
      })
    },
    getTags(reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/FargoTest/Tag/GetTag', {
        searchQuery: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
        categoryId: null
      }).then(res => {
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
      }).catch(err => {
        console.log(err)
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
        axios.post(vars.api_base2 + '/FargoTest/Tag/CreateTag', this.tagData).then(res => {
          if (res.data.isSuccess) {
            this.createDialog = false
            this.tagData = {
              text: '',
              img: '',
              categoryId: null
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
          this.$q.notify({
            type: 'negative',
            message: 'مشکلی پیش آمد.'
          })
        })
      }
    },
    openEditDialog(tag) {
      this.editDialog = !this.editDialog
      this.selectedTagToEdit = tag
    },
    deleteTag(tagId) {
      axios.delete(vars.api_base2 + `/FargoTest/Tag/DeleteTag?id_=${tagId}`).then(res => {
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
      } else {
        axios.put(vars.api_base2 + '/FargoTest/Tag/UpdateTag', {
          text: this.selectedTagToEdit.text,
          img: this.selectedTagToEdit.img,
          categoryId: this.selectedTagToEdit.category_id,
          id: this.selectedTagToEdit.id
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
          this.$q.notify({
            type: 'negative',
            message: 'مشکلی پیش آمد.'
          })
          this.isUpdating = false
        })
      }
    }
  },
  created() {
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
