<template>
  <div class="reports-container">
    <q-input
      v-model="search"
      outlined
      dense
      placeholder="جستجو ..."
      class="q-mb-md"
      @update:model-value="getSearchItems"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="row">
      <div class="col-12">
        <div class="title flex justify-between" style="align-items: center">
          <span>گزارش های&zwnj;های موجود</span>
          <q-select
            dense
            outlined
            v-model="selectedTag.id"
            :options="selectOptions"
            :option-value="'id'"
            :option-label="'text'"
            label="انتخاب تگ"
            emit-value
            map-options
            class="q-ml-md"
            style="min-width: 150px"
            @update:model-value="changeReports"
          />
        </div>
      </div>
      <div class="col-12">
        <div class="reports-wrapper">
          <q-table
            :table-style="
              'counter-reset: cssRowCounter ' +
              (pagination.page - 1) * pagination.rowsPerPage +
              ';'
            "
            :columns="columns"
            :rows="reports"
            v-model:pagination="pagination"
            :loading="loading"
            @request="getReport"
            :rows-per-page-options="[5, 10, 20, 30, 40, 50]"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  <span
                    v-if="col.field === 'text'"
                    class="description"
                    @click="showDescriptionDialog(col.value)"
                  >
                    {{ col.value }}</span
                  >
                  <span
                    v-else
                    :class="{ 'row-numbers': col.field === 'counter' }"
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
          label="افزودن گزارش"
          icon-right="add"
          color="primary"
          class="btn q-py-sm q-mt-md"
          @click="createDialog = !createDialog"
        />
      </div>
    </div>
  </div>
  <q-dialog v-model="detailDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div style="font-size: 1.1rem; margin-left: 2rem">جزئیات گزارش</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="q-my-lg">عنوان: {{ selectedTestToShow.text }}</div>
        <div class="q-my-lg">تگ: {{ selectedTestToShow.tag }}</div>
        <div class="q-my-lg">توضیحات: {{ selectedTestToShow.description }}</div>
        <div class="q-my-lg flex" style="align-items: center">
          <div>
            <span>پولی</span>
            <q-icon
              name="check_circle"
              color="green"
              style="font-size: 1.25rem; margin-right: 0.5rem"
              v-if="selectedTestToShow.being_monetary"
            />
            <q-icon
              name="cancel"
              color="red"
              style="font-size: 1.25rem; margin-right: 0.5rem"
              v-else
            />
          </div>
          <div class="q-ml-lg" v-if="selectedTestToShow.being_monetary">
            قیمت: {{ toCurrency(selectedTestToShow.cost) }} تومان
          </div>
        </div>
        <div class="q-my-lg">
          <span class="label">وضعیت:</span>
          <div>
            <span>فعال</span>
            <q-icon
              name="check_circle"
              color="green"
              style="font-size: 1.25rem; margin-right: 0.5rem"
              v-if="selectedTestToShow.is_active"
            />
            <q-icon
              name="cancel"
              color="red"
              style="font-size: 1.25rem; margin-right: 0.5rem"
              v-else
            />
          </div>
        </div>
        <div class="q-my-lg flex column">
          <span>تصویر:</span>
          <img :src="selectedTestToShow.img" class="q-mt-md" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="editDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش گزارش</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <div class="create-report-container q-mt-md">
              <div class="row">
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="">
                    <span class="label">عنوان گزارش</span>
                    <q-input dense outlined v-model="selectedTestToEdit.text" />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="second-input">
                    <span class="label">تگ گزارش</span>
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
                    <span class="label" style="opacity: 0">قیمت </span>
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
                    <span class="label">قیمت </span>
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
                    <span class="label"
                      >تصویر گزارش (لینک تصویر آپلود شده را قرار دهید)</span
                    >
                    <q-input dense outlined v-model="selectedTestToEdit.img" />
                  </div>
                </div>
                <div class="col-12 q-mt-md">
                  <span class="label">توضیحات گزارش</span>
                  <q-input
                    dense
                    outlined
                    v-model="selectedTestToEdit.description"
                    placeholder="توضیحات گزارش را وارد نمایید..."
                    type="textarea"
                  />
                </div>
                <div class="col-12 q-mt-lg">
                  <span class="label">وضعیت</span>
                  <div>
                    <span v-if="selectedTestToEdit.is_active">فعال</span>
                    <span v-else>غیرفعال</span>
                    <q-checkbox
                      dense
                      v-model="selectedTestToEdit.is_active"
                      class="q-ml-sm"
                    />
                  </div>
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
              <q-inner-loading :showing="updateLoading" />
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="createDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">آپلود گزارش کاربران</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <div class="create-report-container">
              <div class="row">
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="">
                    <span class="label">عنوان گزارش</span>
                    <q-input dense outlined v-model="testData.text" required />
                  </div>
                </div>
                <div class="col-12 col-md-6 q-mt-md">
                  <div class="second-input">
                    <span class="label">تگ </span>
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
                    <span class="label" style="opacity: 0">قیمت </span>
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
                    <span class="label">قیمت </span>
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
                    <span class="label"
                      >تصویر گزارش (لینک تصویر آپلود شده را قرار دهید)</span
                    >
                    <q-input dense outlined v-model="testData.img" />
                  </div>
                </div>
                <div class="col-12 q-mt-md">
                  <span class="label">توضیحات گزارش</span>
                  <q-input
                    dense
                    outlined
                    v-model="testData.description"
                    placeholder="توضیحات گزارش را وارد نمایید..."
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
              label="ثبت گزارش"
              color="primary"
              class="submit-btn"
              @click="setReport"
            >
              <q-inner-loading :showing="isLoading" />
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import vars from "src/vars";
import * as axios from "axios";
import { moneyMixin } from "boot/money";
import { useMeta } from "quasar";

const metaData = {
  title: "گزارش های کاربران",
};

export default defineComponent({
  name: "Reports",
  mixins: [moneyMixin],
  setup() {
    useMeta(metaData);
  },
  data() {
    return {
      reports: [],
      testData: {
        text: "",
        img: "",
        description: "",
        cost: null,
        beingMonetary: false,
        tagId: null,
        isActive: true,
      },
      columns: [
        { name: "counter", align: "center", label: "ردیف", field: "counter" },
        { name: "text", align: "center", label: "عنوان گزارش", field: "text" },
        // { name: 'description', align: 'center', label: 'توضیحات', field: 'description' },
        { name: "tag", align: "center", label: "تگ ", field: "tag" },
        // { name: 'img', align: 'center', label: 'تصویر گزارش', field: 'img' },
        {
          name: "questionsBtn",
          align: "center",
          label: "",
          field: "questionsBtn",
        },
        { name: "detail", align: "center", label: "", field: "detail" },
        { name: "edit", align: "center", label: "", field: "edit" },
        { name: "delete", align: "center", label: "", field: "delete" },
      ],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0,
      },
      detailDialog: false,
      descriptionText: "",
      editDialog: false,
      selectedTestToEdit: {},
      deleteData: {
        id: null,
      },
      createDialog: false,
      loading: false,
      qBody: {
        take: 20,
        skip: 0,
      },
      isLoading: false,
      updateLoading: false,
      search: "",
      tags: [],
      selectedTag: {},
      selectOptions: [],
      tagId: null,
      selectedTestToShow: {},
    };
  },
  created() {
    if (this.$route.query.tagId) {
      this.tagId = Number(this.$route.query.tagId);
    }
    this.getTags();
  },
  methods: {
    setReport() {
      // console.log(this.testData)
      this.isLoading = true;
      if (
        !this.testData.text ||
        !this.testData.tagId ||
        !this.testData.img ||
        !this.testData.description
      ) {
        this.$q.notify({
          type: "negative",
          message: "لطفا مقادیر ضروری را وارد نمایید.",
        });
        this.isLoading = false;
      } else {
        axios
          .post(
            vars.api_base2 + "/api/PsychologicalAssay/CreateTest",
            this.testData,
            {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            }
          )
          .then((response) => {
            // console.log(response)
            if (response.data.isSuccess) {
              this.$q.notify({
                type: "positive",
                message: "گزارش جدید اضافه شد.",
              });
              this.testData = {
                img: "",
                tag1: "",
                tag2: null,
                text: "",
                description: "",
                isActive: true,
              };
              this.createDialog = false;
              this.isLoading = false;
              this.getReport();
            } else {
              for (let i = 0; i < response.data.exceptions.length; i++) {
                this.$q.notify({
                  type: "negative",
                  message: response.data.exceptions[i].persianDescription,
                });
              }
              this.isLoading = false;
            }
          })
          .catch((error) => {
            console.log(error);
            for (let i = 0; i < error.response.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: error.response.data.exceptions[i].persianDescription,
              });
            }
            this.isLoading = false;
          });
      }
    },
    getReport(reqProps) {
      // this.getTags()
      this.loading = true;
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20;
      this.qBody.skip = reqProps
        ? (reqProps?.pagination.page - 1) * this.qBody.take
        : 0;
      this.pagination.rowsPerPage = this.qBody.take;
      axios
        .post(
          vars.api_base2 + "/api/PsychologicalAssay/GetTest",
          {
            SearchQuery: null,
            Take: this.qBody.take,
            Skip: this.qBody.skip,
            IsExportFile: false,
            TagId: this.tagId ? this.tagId : null,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            this.pagination.rowsNumber = response.data.count;
            this.pagination.page = reqProps?.pagination.page ?? 1;
            this.reports = response.data.items;
            if (this.tagId !== null) {
              this.reports = this.reports.filter((test) => {
                return test.tag_id === this.tagId;
              });
            }
          } else {
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: response.data.exceptions[i].persianDescription,
              });
            }
          }
          for (let i = 0; i < this.reports.length; i++) {
            for (let j = 0; j < this.tags.length; j++) {
              if (this.reports[i].tag_id === this.tags[j].id) {
                this.reports[i].tag = this.tags[j].text;
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: "negative",
              message: error.response.data.exceptions[i].persianDescription,
            });
          }
        })
        .then(() => {
          this.loading = false;
        });
    },
    goToQuestions(testId) {
      // console.log(testId)
      this.$router.push({
        name: "questions",
        query: { testId: testId },
      });
    },
    showDescriptionDialog(description) {
      this.showDescription = !this.showDescription;
      this.descriptionText = description;
    },
    openEditDialog(test) {
      this.editDialog = !this.editDialog;
      this.selectedTestToEdit = test;
      // console.log(this.selectedTestToEdit)
    },
    updateTest() {
      this.updateLoading = true;
      if (
        !this.selectedTestToEdit.text ||
        !this.selectedTestToEdit.tag_id ||
        !this.selectedTestToEdit.img ||
        !this.selectedTestToEdit.description
      ) {
        this.$q.notify({
          type: "negative",
          message: "لطفا مقادیر ضروری را وارد نمایید.",
        });
        this.updateLoading = false;
      } else {
        axios
          .post(
            vars.api_base2 + "/api/PsychologicalAssay/UpdateTest",
            {
              text: this.selectedTestToEdit.text,
              img: this.selectedTestToEdit.img,
              description: this.selectedTestToEdit.description,
              cost: this.selectedTestToEdit.being_monetary
                ? Number(this.selectedTestToEdit.cost)
                : null,
              beingMonetary: this.selectedTestToEdit.being_monetary,
              id: this.selectedTestToEdit.id,
              tagId: this.selectedTestToEdit.tag_id,
              isActive: this.selectedTestToEdit.is_active,
            },
            {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            }
          )
          .then((response) => {
            // console.log(response)
            if (response.data.isSuccess) {
              this.$q.notify({
                type: "positive",
                message: "گزارش با موفقیت ویرایش شد.",
              });
              this.getReport();
              this.editDialog = !this.editDialog;
              this.updateLoading = false;
            } else {
              for (let i = 0; i < response.data.exceptions.length; i++) {
                this.$q.notify({
                  type: "negative",
                  message: response.data.exceptions[i].persianDescription,
                });
              }
              this.updateLoading = false;
            }
          })
          .catch((error) => {
            console.log(error);
            for (let i = 0; i < error.response.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: error.response.data.exceptions[i].persianDescription,
              });
            }
            this.updateLoading = false;
          });
      }
    },
    deleteTest(testId) {
      axios
        .post(
          vars.api_base2 + "/api/PsychologicalAssay/DeleteTest",
          {
            Id_: testId,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            this.$q.notify({
              type: "info",
              message: "گزارش با موفقیت حذف شد.",
            });
            this.getReport();
          } else {
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: response.data.exceptions[i].persianDescription,
              });
            }
          }
        })
        .catch((error) => {
          console.log(error);
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: "negative",
              message: error.response.data.exceptions[i].persianDescription,
            });
          }
        });
    },
    getSearchItems() {
      axios
        .post(
          vars.api_base2 + "/api/PsychologicalAssay/GetTest",
          {
            SearchQuery: this.search,
            TagId: null,
            Take: null,
            Skip: null,
            IsExportFile: false,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            this.reports = response.data.items;
          } else {
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: response.data.exceptions[i].persianDescription,
              });
            }
          }
        })
        .catch((error) => {
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: "negative",
              message: error.response.data.exceptions[i].persianDescription,
            });
          }
          console.log(error);
        });
    },
    openDetailDialog(test) {
      this.detailDialog = !this.detailDialog;
      this.selectedTestToShow = test;
    },
    getTags() {
      axios
        .post(
          vars.api_base2 + "/api/PsychologicalAssay/GetTag",
          {
            SearchQuery: null,
            IsExportFile: true,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        )
        .then((res) => {
          if (res.data.isSuccess) {
            this.tags = res.data.items;
            // console.log(this.tags)
            this.selectOptions = [
              {
                id: 0,
                text: "همه",
              },
              ...res.data.items,
            ];
            if (this.tagId !== null) {
              this.selectedTag.id = this.tags.find(
                (tag) => tag.id === this.tagId
              ).id;
            } else {
              this.selectedTag.id = this.selectOptions.find(
                (tag) => tag.id === 0
              ).id;
            }
          } else {
            for (let i = 0; i < res.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: res.data.exceptions[i].persianDescription,
              });
            }
          }
          this.getReport();
        })
        .catch((err) => {
          console.log(err);
          for (let i = 0; i < err.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: "negative",
              message: err.response.data.exceptions[i].persianDescription,
            });
          }
        })
        .then(() => {
          this.loading = false;
        });
    },
    changeReports() {
      this.loading = true;
      axios
        .post(
          vars.api_base2 + "/api/PsychologicalAssay/ ",
          {
            SearchQuery: null,
            TagId: this.selectedTag.id !== 0 ? this.selectedTag.id : null,
            IsExportFile: true,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            if (this.selectedTag.id === 0) {
              this.reports = response.data.items;
            } else {
              this.reports = response.data.items.filter((tag) => {
                return tag.tag_id === this.selectedTag.id;
              });
            }
            for (let i = 0; i < this.reports.length; i++) {
              for (let j = 0; j < this.tags.length; j++) {
                if (this.reports[i].tag_id === this.tags[j].id) {
                  this.reports[i].tag = this.tags[j].text;
                }
              }
            }
          } else {
            for (let i = 0; i < response.data.exceptions.length; i++) {
              this.$q.notify({
                type: "negative",
                message: response.data.exceptions[i].persianDescription,
              });
            }
          }
        })
        .catch((error) => {
          console.log(error);
          for (let i = 0; i < error.response.data.exceptions.length; i++) {
            this.$q.notify({
              type: "negative",
              message: error.response.data.exceptions[i].persianDescription,
            });
          }
        })
        .then(() => {
          this.loading = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.q-page-container {
  //overflow: hidden;
}
.reports-container {
  padding: 1rem;
  overflow: hidden;
  .title {
    font-size: 1.1rem;
    margin-top: 2rem;
  }
  .create-report-container {
    margin-top: 2rem;
    @media (min-width: 1024px) {
      .q-input {
        margin-right: 1rem;
      }
    }
  }
  .reports-wrapper {
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
