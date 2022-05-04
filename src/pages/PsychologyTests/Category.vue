<template>
  <div class="test-categories-container">
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
      <span>دسته&zwnj;بندی&zwnj;های موجود</span>
    </div>
    <div class="categories-wrapper">
      <q-table
        :table-style="'counter-reset: cssRowCounter ' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
        :columns="columns"
        :rows="categories"
        v-model:pagination="pagination"
        :loading="loading"
        @request="getCategories"
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
                v-if="col.field === 'tagsBtn'"
                unelevated
                dense
                label="مشاهده تگ&zwnj;ها"
                class="text-primary"
                style="font-size: .75rem"
                @click="goToTags(props.row.id)"
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
                @click="deleteCategory(props.row.id)"
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
        label="افزودن دسته بندی"
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
        <div class="text-h6">افزودن دسته&zwnj;بندی</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <span class="label">عنوان</span>
            <q-input
              outlined
              dense
              v-model="categoryData.text"
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">رنگ (کد hex رنگ را بنویسید و یا از رنگ&zwnj;های موجود انتخاب کنید)</span>
<!--            <q-input
              outlined
              dense
              v-model="categoryData.mainColor"
              type="color"
              class="color"
            />-->
            <q-input
              filled
              v-model="categoryData.mainColor"
              class="color"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="categoryData.mainColor" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">تصویر (محتوای تصویر svg را قرار دهید)</span>
            <q-input
              outlined
              dense
              v-model="categoryData.img"
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
              @click="setCategory"
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
        <div class="text-h6">ویرایش دسته&zwnj;بندی</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <span class="label">عنوان</span>
            <q-input
              outlined
              dense
              v-model="selectedCategoryToEdit.text"
            />
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">رنگ</span>
            <q-input
              filled
              v-model="selectedCategoryToEdit.main_color"
              class="my-input"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="selectedCategoryToEdit.main_color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 q-mt-lg">
            <span class="label">تصویر</span>
            <div>
              <img :src="selectedCategoryToEdit.img">
            </div>
            <q-input
              outlined
              dense
              v-model="selectedCategoryToEdit.img"
            />
          </div>
          <div class="col-12">
            <q-btn
              unelevated
              dense
              color="primary"
              label="ثبت"
              class="submit-btn q-mt-lg"
              @click="updateCategory"
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
import vars from '../../vars'
import * as axios from 'axios'

export default defineComponent({
  name: 'Category',
  data() {
    return {
      search: '',
      categories: [],
      columns: [
        { name: 'counter', align: 'center', label: 'ردیف', field: 'counter' },
        { name: 'title', align: 'center', label: 'عنوان', field: 'text' },
        { name: 'color', align: 'center', label: 'رنگ', field: 'main_color' },
        { name: 'image', align: 'center', label: 'تصویر', field: 'img' },
        { name: 'tagsBtn', align: 'center', label: '', field: 'tagsBtn' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' },
      ],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      loading: false,
      createDialog: false,
      qBody: {
        take: 20,
        skip:0
      },
      categoryData: {
        text: '',
        img: '',
        mainColor: ''
      },
      isLoading: false,
      editDialog: false,
      selectedCategoryToEdit: {},
      isUpdating: false,
      newImg: {}
    }
  },
  methods: {
    getCategories(reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/FargoTest/Category/GetCategory', {
        searchQuery: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false
      }).then(res => {
        this.pagination.rowsNumber = res.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        this.categories = res.data.items
      }).catch(err => {
        console.log(err)
      }).then(() => {
        this.loading = false
      })
    },
    setCategory() {
      this.isLoading = false
      if (!this.categoryData.text || !this.categoryData.mainColor || !this.categoryData.img) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.isLoading = false
      } else {
        if (!this.categoryData.mainColor.includes('#')) {
          this.categoryData.mainColor = this.rgbToHex(this.categoryData.mainColor)
        }
        axios.post(vars.api_base2 + '/FargoTest/Category/CreateCategory', this.categoryData).then(res => {
          if (res.data.isSuccess) {
            this.createDialog = false
            this.categoryData = {
              text: '',
              img: '',
              mainColor: ''
            }
            this.$q.notify({
              type: 'positive',
              message: 'دسته\u200Cبندی با موفقیت اضافه شد.'
            })
            this.isLoading = false
            this.getCategories()
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
            type: 'positive',
            message: 'مشکلی پیش آمد.'
          })
        })
      }
    },
    deleteCategory(categoryId) {
      axios.delete(vars.api_base2 + `/FargoTest/Category/DeleteCategory?id_=${categoryId}`).then(res => {
        if (res.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'دسته\u200Cبندی با موفقیت حذف شد.'
          })
          this.getCategories()
        } else {
          for (let i = 0; i < res.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: res.data.exceptions[i].persianDescription
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
      })
    },
    openEditDialog(category) {
      this.editDialog = !this.editDialog
      this.selectedCategoryToEdit = category
    },
    updateCategory() {
      this.isUpdating = true
      if (!this.selectedCategoryToEdit.text || !this.selectedCategoryToEdit.main_color || !this.selectedCategoryToEdit.img) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا همه مقادیر را وارد کنید.'
        })
      } else {
        if (!this.selectedCategoryToEdit.main_color.includes('#')) {
          this.selectedCategoryToEdit.main_color = this.rgbToHex(this.selectedCategoryToEdit.main_color)
        }
        axios.put(vars.api_base2 + '/FargoTest/Category/UpdateCategory', {
          text: this.selectedCategoryToEdit.text,
          img: this.selectedCategoryToEdit.img,
          mainColor: this.selectedCategoryToEdit.main_color,
          id: this.selectedCategoryToEdit.id
        }).then(res => {
          if (res.data.isSuccess) {
            this.editDialog = false
            this.getCategories()
            this.$q.notify({
              type: 'positive',
              message: 'دسته\u200Cبندی با موفقیت برورسانی شد.'
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
    },
    rgbToHex(a){
      a = a.replace(/[^\d,]/g,"").split(",");
      return"#"+((1<<24)+(+a[0]<<16)+(+a[1]<<8)+ +a[2]).toString(16).slice(1)
    },
    goToTags(categoryId) {
      this.$router.push({
        name: 'tags',
        query: { categoryId }
      })
    }
  },
  created() {
    this.getCategories()
  }
})
</script>

<style lang="scss" scoped>
.test-categories-container {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    margin-top: 2rem;
  }

  .categories-wrapper {
    margin-top: 2rem;
  }
}
</style>
