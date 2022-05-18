<template>
  <div class="comments-container">
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
      <span>&zwnj;دیدگاه&zwnj;های موجود</span>
    </div>
    <div class="comments-wrapper">
      <q-table
        :table-style="'counter-reset: cssRowCounter' + ((pagination.page - 1) * pagination.rowsPerPage) + ';'"
        :columns="columns"
        :rows="comments"
        v-model:pagination="pagination"
        :loading="loading"
        @request="getComments"
        :filter="search"
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
                v-if="col.field === 'counter'"
                :class="{ 'row-numbers': col.field === 'counter' }"
              >
                {{ col.value }}
              </span>
              {{ col.value }}
              <q-btn
                v-if="col.field === 'detail'"
                unelevated
                dense
                round
                icon="visibility"
                class="detail-btn"
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
                @click="deleteComment(props.row.id)"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
  <q-dialog v-model="detailDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">جزئیات دیدگاه</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش دیدگاه</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import vars from '../../vars';
import * as axios from 'axios';

export default defineComponent({
  name: 'comments',
  data() {
    return {
      search: '',
      columns: [
        { name: 'counter', align: 'center', label: 'ردیف', field: 'counter' },
        { name: 'userName', align: 'center', label: 'نام کاربر', field: 'name' },
        { name: 'text', align: 'center', label: 'متن', field: 'text' },
        { name: 'detail', align: 'center', label: '', field: 'detail' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' },
      ],
      comments: [],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      loading: false,
      qBody: {
        take: 20,
        skip:0
      },
      selectedCommentToShow: {},
      selectedCommentToEdit: {},
      detailDialog: false,
      editDialog: false,
      createDialog: false
    }
  },
  methods: {
    getComments(reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/GetComment', {
        SearchQuery: null,
        Take: this.qBody.take,
        Skip: this.qBody.skip,
        IsExportFile: false,
        PsychologyTestId: 1
      }).then(res => {
        if (res.data.isSuccess) {
          this.pagination.rowsNumber = res.data.count
          this.pagination.page = reqProps?.pagination.page ?? 1
          this.comments = res.data.items
        } else {
          for (let i = 0; i < res.data.exceptions.length; i++) {
            this.$q.notify({
              type: 'negative',
              message: res.data.exceptions[i].persianDescription
            })
          }
          this.loading = false
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
    openDetailDialog(comment) {
      this.detailDialog = true
      this.selectedCommentToShow = comment
    },
    openEditDialog(comment) {
      this.editDialog = true
      this.selectedCommentToEdit = comment
    },
    deleteComment(id) {
      axios.post(vars.api_base2 + '/api/PsychologicalAssay/DeleteComment', {
        Id_: id
      }).then(res => {
        if (res.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'دیدگاه با موفقیت حذف شد.'
          })
          this.getComments()
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
    }
  },
  created() {
    this.getComments()
  }
})
</script>

<style lang="scss" scoped>
.comments-container {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    margin-top: 2rem;
  }

  .comments-wrapper {
    margin-top: 2rem;
  }
}
</style>
