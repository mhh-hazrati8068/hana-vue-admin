<template>
  <div class="questions-container">
    <div class="row">
      <div class="col-12">
        <span class="title">افزودن سوال</span>
      </div>
      <div class="col-12">
        <div class="create-question-wrapper">
          <div class="row">
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">عنوان سوال</span>
                <q-input
                  v-model="createQuestionData.title"
                  outlined
                  dense
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">نوع سوال</span>
                <q-select
                  v-model="createQuestionData.typeQuestion"
                  outlined
                  dense
                  use-input
                  use-chips
                  input-debounce="0"
                  @new-value="createValue"
                  :options="typeQuestionOptions"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label"> فایل صوتی</span>
                <q-file
                  v-model="chosenSound"
                  outlined
                  dense
                  @input="onDocumentPicked($event)"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label"> فایل صوتی در صورت عدم موفقیت</span>
                <q-file
                  v-model="chosenFailedSound"
                  outlined
                  dense
                  @input="onFailedDocumentPicked($event)"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">نام آزمون</span>
                <q-select
                  v-model="createQuestionData.examName"
                  outlined
                  dense
                  :options="examNameOptions"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">تعداد تلاش</span>
                <q-input
                  v-model="createQuestionData.tryNumber"
                  outlined
                  dense
                  type="number"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">زمان (برحسب ثانیه)</span>
                <q-input
                  v-model="createQuestionData.time"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">دسته&zwnj;بندی سوال</span>
                <q-select
                  v-model="createQuestionData.categoryQuestion"
                  outlined
                  dense
                  :options="questionCategoryOptions"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">ترتیب (index)</span>
                <q-input
                  v-model="createQuestionData.index"
                  outlined
                  dense
                  type="number"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">تعداد سطر</span>
                <q-input
                  v-model="createQuestionData.rows"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <q-checkbox
                v-model="createQuestionData.showTimer"
                label="نمایش زمان"
                style="font-size: 1rem"
              />
            </div>
            <div class="col-12 flex justify-end q-mt-lg">
              <q-btn
                unelevated
                dense
                label="ثبت"
                color="primary"
                style="width: 15%"
                @click="setQuestion"
              >
                <q-inner-loading
                  :showing="isLoading"
                />
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="existing-questions">
      <div class="row">
        <div class="col-12">
          <span class="title">سوال&zwnj;های موجود</span>
        </div>
        <div class="col-12">
          <q-table
            :pagination="pagination"
            :columns="columns"
            :rows="questions"
            class="q-mt-lg"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.value }}
                  <q-btn
                    v-if="col.field === 'updateImages'"
                    unelevated
                    dense
                    label="ویرایش تصاویر"
                    color="primary"
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
                    :disable="props.row.hasAnswer"
                    @click="deleteQuestion(props.row)"
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
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">عنوان سوال</span>
              <q-input
                v-model="selectedQuestionToEdit.title"
                outlined
                dense
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label">نوع سوال</span>
              <q-select
                v-model="selectedQuestionToEdit.typeQuestionLabel"
                outlined
                dense
                use-input
                use-chips
                input-debounce="0"
                @new-value="createValue"
                :options="typeQuestionOptions"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label"> فایل صوتی</span>
              <div v-if="selectedQuestionToEdit.mediaQuestion !== null">
                <q-file
                  v-model="chosenSound"
                  v-show="false"
                  outlined
                  dense
                  @input="onDocumentPicked($event)"
                />
                <q-input
                  dense
                  outlined
                  v-model="selectedQuestionToEdit.mediaQuestion[0].fileName"
                  readonly
                />
                <q-btn
                  unelevated
                  dense
                  color="primary"
                  label="تغییر فایل صوتی"
                  class="q-mt-md full-width"
                />
              </div>
              <div v-else>
                <q-file
                  v-model="chosenSound"
                  outlined
                  dense
                  @input="onDocumentPicked($event)"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label"> فایل صوتی در صورت عدم موفقیت</span>
              <div v-if="selectedQuestionToEdit.mediaFailed !== null">
                <q-file
                  v-show="false"
                  v-model="chosenFailedSound"
                  outlined
                  dense
                  @input="onFailedDocumentPicked($event)"
                />
                <q-input
                  dense
                  outlined
                  v-model="selectedQuestionToEdit.mediaFailed[0].url"
                  readonly
                />
                <q-btn
                  unelevated
                  dense
                  color="primary"
                  label="تغییر فایل صوتی"
                  class="q-mt-md full-width"
                />
              </div>
              <div v-else>
                <q-file
                  v-model="chosenFailedSound"
                  outlined
                  dense
                  @input="onFailedDocumentPicked($event)"
                />
              </div>
            </div>
          </div>
<!--          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">نام آزمون</span>
              <q-select
                v-model="selectedQuestionToEdit.examName"
                outlined
                dense
                :options="examNameOptions"
              />
            </div>
          </div>-->
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">تعداد تلاش</span>
              <q-input
                v-model="selectedQuestionToEdit.tryNumber"
                outlined
                dense
                type="number"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label">زمان (برحسب ثانیه)</span>
              <q-input
                v-model="selectedQuestionToEdit.time"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">دسته&zwnj;بندی سوال</span>
              <q-select
                v-model="selectedQuestionToEdit.categoryQuestionLabel"
                outlined
                dense
                :options="questionCategoryOptions"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label">ترتیب (index)</span>
              <q-input
                v-model="selectedQuestionIndex"
                outlined
                dense
                type="number"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
              <div class="input">
                <span class="label">فایل تصویری (ترتیب انتخاب عکس مهم میباشد)</span>
                <q-file
                  v-model="createQuestionData.url_img"
                  outlined
                  dense
                  multiple
                  @input="uploadImages($event)"
                />
              </div>
            </div>
<!--          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label">موقعیت افقی</span>
              <q-input
                v-model="createQuestionData.location_x"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">موقعیت عمودی</span>
              <q-input
                v-model="createQuestionData.location_y"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
          </div>-->
          <div class="col-12">
            <div class="row" v-for="(image, index) in numOfUploadedImages" :key="index">
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input">
                  <span class="label">ارتفاع</span>
                  <q-input
                    v-model="images[index].height"
                    outlined
                    dense
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input q-ml-sm">
                  <span class="label">عرض</span>
                  <q-input
                    v-model="images[index].width"
                    outlined
                    dense
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 q-mt-lg flex justify-center">
            <q-btn
              unelevated
              dense
              label="ثبت"
              color="primary"
              style="width: 20%"
              @click="updateQuestion"
            >
              <q-inner-loading
                :showing="UpdateLoading"
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
import vars from "src/vars";
import * as axios from "axios";

export default defineComponent({
  name: 'Questions',
  data () {
    return {
      createQuestionData: {
        title: '',
        typeQuestion: null,
        soundQuestion: '',
        soundFailed: '',
        index: null,
        categoryQuestion: null,
        tryNumber: null,
        time: null,
        examName: { value: 1, label: 'wisc-iv' },
        url_img: '',
        location_x: null,
        location_y: null,
        height: null,
        width: null,
        rows: null,
        showTimer: false
      },
      chosenSound: {},
      chosenFailedSound: {},
      typeQuestionOptions: [
        { value: 1, label: 'قرار دادنی' },
        { value: 2, label: 'صدا' },
        { value: 3, label: 'انتخاب کردنی' },
        { value: 4, label: 'خط زدنی' }
      ],
      questionCategoryOptions: [
        { value: 1, label: 'طراحی با مکعب\u200Cها' },
        { value: 2, label: 'شباهت\u200Cها' },
        { value: 3, label: 'فراخوانی ارقام' },
        { value: 4, label: 'مفاهیم تصویری' },
        { value: 5, label: 'رمز نویسی' },
        { value: 6, label: 'واژگان' },
        { value: 7, label: 'توالی حرف و عدد' },
        { value: 8, label: 'استدلال تصویری' },
        { value: 9, label: 'درک مطلب' },
        { value: 10, label: 'نمادیابی' },
        { value: 11, label: 'تکمیل تصاویر' },
        { value: 12, label: 'خط زنی' },
        { value: 13, label: 'اطلاعات عمومی' },
        { value: 14, label: 'حساب' },
        { value: 15, label: 'استدلال کلامی' },
      ],
      examNameOptions: [
        { value: 1, label: 'wisc-iv' },
      ],
      questions: [],
      columns: [
        { name: 'index', align: 'center', label: 'ترتیب', field: 'index'},
        { name: 'title', align: 'center', label: 'عنوان سوال', field: 'title' },
        { name: 'categoryQuestion', align: 'center', label: 'دسته\u200Cبندی سوال', field: 'categoryQuestionLabel' },
        { name: 'typeQuestion', align: 'center', label: 'نوع سوال', field: 'typeQuestionLabel' },
        { name: 'answersCount', align: 'center', label: 'تعداد پاسخ\u200Cها', field: 'answersCount' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' },
        { name: 'updateImages', align: 'center', label: '', field: 'updateImages' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      answers: [],
      editDialog: false,
      selectedQuestionToEdit: {},
      selectedQuestionIndex: null,
      numOfUploadedImages: 0,
      images: [],
      isLoading: false,
      UpdateLoading: false
    }
  },
  methods: {
    setQuestion () {
      this.isLoading = true
      let isReiterativeIndex = false;
      for (let i = 0; i < this.questions.length; i++) {
        if (this.questions[i].index === Number(this.createQuestionData.index)) {
          isReiterativeIndex = true
        }
      }
      const mediaQuestion = [
        {
          Url: this.chosenSound.__key
        }
      ]
      const mediaFailed = [
        {
          Url: this.chosenFailedSound.__key
        }
      ]
      let fd = new FormData()
      if (!this.createQuestionData.title || !this.createQuestionData.typeQuestion || !this.createQuestionData.index ||
        !this.createQuestionData.categoryQuestion || !this.createQuestionData.tryNumber ||
        !this.createQuestionData.time || !this.createQuestionData.examName) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.isLoading = false
      } else {
        if (!isReiterativeIndex) {
          if (Object.keys(this.chosenSound).length !== 0) {
            if (this.chosenSound.type === 'audio/mpeg') {
              fd.append('mediaQuestion', JSON.stringify(mediaQuestion))
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل صوتی به درستی انتخاب نشده است.'
              })
              this.isLoading = false
              return false
            }
          }
          if (Object.keys(this.chosenFailedSound).length !== 0) {
            if (this.chosenFailedSound.type === 'audio/mpeg') {
              fd.append('mediaFailed', JSON.stringify(mediaFailed))
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل صوتی به درستی انتخاب نشده است.'
              })
              this.isLoading = false
              return false
            }
          }
          fd.append('files', this.chosenSound)
          fd.append('files', this.chosenFailedSound)
          fd.append('title', this.createQuestionData.title)
          fd.append('typeQuestion', Number(this.createQuestionData.typeQuestion.value))
          fd.append('index', this.createQuestionData.index)
          fd.append('categoryQuestion', this.createQuestionData.categoryQuestion.value)
          fd.append('tryNumber', this.createQuestionData.tryNumber)
          fd.append('time', this.createQuestionData.time)
          fd.append('examName', this.createQuestionData.examName.label)
          fd.append('rows', this.createQuestionData.rows)
          fd.append('showTimer', this.createQuestionData.showTimer)

          axios.post(vars.api_base + '/api/PsychologicalAssay/UploadQuestion', fd).then(response => {
            console.log(response)
            if (response.data.isSuccess) {
              this.getAllQuestion()
              this.createQuestionData = {
                title: '',
                typeQuestion: null,
                soundQuestion: '',
                soundFailed: '',
                index: null,
                categoryQuestion: null,
                tryNumber: null,
                time: null,
                rowCount: null,
                showTime: false
              }
              this.chosenSound = {}
              this.chosenFailedSound = {}
              this.isLoading = false
              this.$q.notify({
                type: 'positive',
                message: 'سوال با موفقیت اضافه شد.'
              })
            } else {
              this.isLoading = false
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[0].exception.persianDescription
              })
            }
          }).catch(error => {
            console.log(error)
            this.$q.notify({
              type: 'negative',
              message: 'مشکلی پیش آمد.'
            })
            this.isLoading = false
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'ترتیب سوال تکراری است.'
          })
          this.isLoading = false
        }
      }
    },
    createValue (val, done) {
      if (val.length > 0) {
        if (!this.typeQuestionOptions.includes(val)) {
          this.typeQuestionOptions.push(val)
        }
        done(val, 'toggle')
      }
    },
    onDocumentPicked (file) {
      this.createQuestionData.soundQuestion = URL.createObjectURL(file.target.files[0])
    },
    onFailedDocumentPicked (file) {
      this.createQuestionData.soundFailed = URL.createObjectURL(file.target.files[0])
    },
    getAllQuestion () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetHanaAnswer').then(response => {
        this.answers = response.data.item
      }).catch(error => {
        console.log(error)
      })
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetHanaQuestion').then(response => {
        this.questions = response.data.item.sort((a, b) => {
          return a.index - b.index
        })
        let answerCount = 0
        for (let i = 0; i < this.questions.length; i++) {
          switch (this.questions[i].typeQuestion) {
            case 1:
              this.questions[i] = { typeQuestionLabel: 'قرار دادنی', ...this.questions[i] }
              break
            case 2:
              this.questions[i] = { typeQuestionLabel: 'صدا', ...this.questions[i] }
              break
            case 3:
              this.questions[i] = { typeQuestionLabel: 'انتخاب کردنی', ...this.questions[i] }
              break
            case 4:
              this.questions[i] = { typeQuestionLabel: 'خط زدنی', ...this.questions[i] }
              break
            default:
              this.questions[i] = { typeQuestionLabel: '-', ...this.questions[i] }
              break
          }
          switch (this.questions[i].categoryQuestion) {
            case 1:
              this.questions[i] = { categoryQuestionLabel: 'طراحی با مکعب\u200Cها', ...this.questions[i] }
              break
            case 2:
              this.questions[i] = { categoryQuestionLabel: 'شباهت\u200Cها', ...this.questions[i] }
              break
            case 3:
              this.questions[i] = { categoryQuestionLabel: 'فراخوانی ارقام', ...this.questions[i] }
              break
            case 4:
              this.questions[i] = { categoryQuestionLabel: 'مفاهیم تصویری', ...this.questions[i] }
              break
            case 5:
              this.questions[i] = { categoryQuestionLabel: 'رمز نویسی', ...this.questions[i] }
              break
            case 6:
              this.questions[i] = { categoryQuestionLabel: 'واژگان', ...this.questions[i] }
              break
            case 7:
              this.questions[i] = { categoryQuestionLabel: 'توالی حرف و عدد', ...this.questions[i] }
              break
            case 8:
              this.questions[i] = { categoryQuestionLabel: 'استدلال تصویری', ...this.questions[i] }
              break
            case 9:
              this.questions[i] = { categoryQuestionLabel: 'درک مطلب', ...this.questions[i] }
              break
            case 10:
              this.questions[i] = { categoryQuestionLabel: 'نمادیابی', ...this.questions[i] }
              break
            case 11:
              this.questions[i] = { categoryQuestionLabel: 'تکمیل تصاویر', ...this.questions[i] }
              break
            case 12:
              this.questions[i] = { categoryQuestionLabel: 'خط زنی', ...this.questions[i] }
              break
            case 13:
              this.questions[i] = { categoryQuestionLabel: 'اطلاعات عمومی', ...this.questions[i] }
              break
            case 14:
              this.questions[i] = { categoryQuestionLabel: 'حساب', ...this.questions[i] }
              break
            case 15:
              this.questions[i] = { categoryQuestionLabel: 'استدلال کلامی', ...this.questions[i] }
              break
            default:
              this.questions[i] = { categoryQuestionLabel: '-', ...this.questions[i] }
              break
          }
          this.questions[i] = { answersCount: answerCount, ...this.questions[i] }
          for (let j = 0; j < this.answers.length; j++) {
            if (this.questions[i].id === this.answers[j].questionId) {
              this.questions[i].answersCount++
            }
          }
          if (this.questions[i].answersCount > 0) {
            this.questions[i] = { hasAnswer: true, ...this.questions[i] }
          }
        }
      }).catch(error => {
        console.log(error)
      })
    },
    openEditDialog (question) {
      this.editDialog = !this.editDialog
      this.selectedQuestionToEdit = question
      console.log(this.selectedQuestionToEdit)
      switch (this.selectedQuestionToEdit.typeQuestion) {
        case 1:
          this.selectedQuestionToEdit = { typeQuestionLabel: 'قرار دادنی', ...this.selectedQuestionToEdit }
          break
        case 2:
          this.selectedQuestionToEdit = { typeQuestionLabel: 'صدا', ...this.selectedQuestionToEdit }
          break
        case 3:
          this.selectedQuestionToEdit = { typeQuestionLabel: 'انتخاب کردنی', ...this.selectedQuestionToEdit }
          break
        case 4:
          this.selectedQuestionToEdit = { typeQuestionLabel: 'خط زدنی', ...this.selectedQuestionToEdit }
          break
        default:
          this.selectedQuestionToEdit = { typeQuestionLabel: '-', ...this.selectedQuestionToEdit }
          break
      }
      switch (this.selectedQuestionToEdit.categoryQuestion) {
        case 1:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'طراحی با مکعب\u200Cها', ...this.selectedQuestionToEdit }
          break
        case 2:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'شباهت\u200Cها', ...this.selectedQuestionToEdit }
          break
        case 3:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'فراخوانی ارقام', ...this.selectedQuestionToEdit }
          break
        case 4:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'مفاهیم تصویری', ...this.selectedQuestionToEdit }
          break
        case 5:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'رمز نویسی', ...this.selectedQuestionToEdit }
          break
        case 6:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'واژگان', ...this.selectedQuestionToEdit }
          break
        case 7:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'توالی حرف و عدد', ...this.selectedQuestionToEdit }
          break
        case 8:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'استدلال تصویری', ...this.selectedQuestionToEdit }
          break
        case 9:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'درک مطلب', ...this.selectedQuestionToEdit }
          break
        case 10:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'نمادیابی', ...this.selectedQuestionToEdit }
          break
        case 11:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'تکمیل تصاویر', ...this.selectedQuestionToEdit }
          break
        case 12:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'خط زنی', ...this.selectedQuestionToEdit }
          break
        case 13:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'اطلاعات عمومی', ...this.selectedQuestionToEdit }
          break
        case 14:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'حساب', ...this.selectedQuestionToEdit }
          break
        case 15:
          this.selectedQuestionToEdit = { categoryQuestionLabel: 'استدلال کلامی', ...this.selectedQuestionToEdit }
          break
        default:
          this.selectedQuestionToEdit = { categoryQuestionLabel: '-', ...this.selectedQuestionToEdit }
          break
      }
      this.selectedQuestionIndex = this.selectedQuestionToEdit.index
    },
    updateQuestion () {
      this.UpdateLoading = true
      let isReiterativeIndex = false;
      for (let i = 0; i < this.questions.length; i++) {
        if (this.selectedQuestionToEdit.index !== this.selectedQuestionIndex) {
          if (this.questions[i].index === Number(this.selectedQuestionIndex)) {
            isReiterativeIndex = true
          }
        }
      }
      if (this.selectedQuestionToEdit.mediaQuestion !== null) {
        this.selectedQuestionToEdit.mediaQuestion[0] = {
          Url: this.selectedQuestionToEdit.mediaQuestion[0].url
        }
      } else if (Object.keys(this.chosenSound).length !== 0) {
        this.selectedQuestionToEdit.mediaQuestion = [{
          Url: this.chosenSound.__key
        }]
      }
      if (this.selectedQuestionToEdit.mediaFailed !== null) {
        this.selectedQuestionToEdit.mediaFailed[0] = {
          Url: this.chosenFailedSound.__key
        }
      } else if (Object.keys(this.chosenFailedSound).length !== 0) {
        this.selectedQuestionToEdit.mediaFailed = [{
          Url: this.chosenFailedSound.__key
        }]
      }
      let fd = new FormData()
      if (!this.selectedQuestionToEdit.title || !this.selectedQuestionToEdit.typeQuestionLabel || !this.selectedQuestionToEdit.index ||
        !this.selectedQuestionToEdit.categoryQuestionLabel || !this.selectedQuestionToEdit.tryNumber ||
        !this.selectedQuestionToEdit.time) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.UpdateLoading = false
      } else {
        if (!isReiterativeIndex) {
          if (Object.keys(this.chosenSound).length !== 0) {
            if (this.chosenSound.type === 'audio/mpeg') {
              fd.append('mediaQuestion', JSON.stringify(this.selectedQuestionToEdit.mediaQuestion))
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل صوتی به درستی انتخاب نشده است.'
              })
              this.isLoading = false
              return false
            }
          }
          if (Object.keys(this.chosenFailedSound).length !== 0) {
            if (this.chosenFailedSound.type === 'audio/mpeg') {
              fd.append('mediaFailed', JSON.stringify(this.selectedQuestionToEdit.mediaFailed))
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل صوتی به درستی انتخاب نشده است.'
              })
              this.isLoading = false
              return false
            }
          }
          fd.append('files', this.chosenSound)
          fd.append('files', this.chosenFailedSound)
          for (let i = 1; i <= this.numOfUploadedImages; i++) {
            if (this.createQuestionData.url_img[i-1].type === 'image/png' || this.createQuestionData.url_img[i-1].type === 'image/jpeg') {
              fd.append('files', this.createQuestionData.url_img[i-1])
              if (this.selectedQuestionToEdit.mediaQuestion[0]) {
                this.selectedQuestionToEdit.mediaQuestion[i] = {
                  Url: this.createQuestionData.url_img[i].__key,
                  Height: Number(this.images[i].height),
                  Width: Number(this.images[i].width)
                }
              } else {
                this.selectedQuestionToEdit.mediaQuestion[i] = {
                  Url: this.createQuestionData.url_img[i].__key,
                  Height: Number(this.images[i].height),
                  Width: Number(this.images[i].width)
                }
              }
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل تصویری به درستی انتخاب نشده است.'
              })
              this.UpdateLoading = false
            }
          }
          fd.append('mediaQuestion', JSON.stringify(this.selectedQuestionToEdit.mediaQuestion))
          fd.append('title', this.selectedQuestionToEdit.title)
          if (this.selectedQuestionToEdit.index !== this.selectedQuestionIndex) {
            fd.append('index', this.selectedQuestionIndex)
          } else {
            fd.append('index', this.selectedQuestionToEdit.index)
          }
          fd.append('tryNumber', this.selectedQuestionToEdit.tryNumber)
          fd.append('time', this.selectedQuestionToEdit.time)
          fd.append('examName', this.selectedQuestionToEdit.examName)
          fd.append('rows', this.selectedQuestionToEdit.rows)
          fd.append('showTimer', this.selectedQuestionToEdit.showTimer)
          fd.append('id', this.selectedQuestionToEdit.id)
          if (this.selectedQuestionToEdit.typeQuestionLabel.constructor === Object) {
            fd.append('typeQuestion', Number(this.selectedQuestionToEdit.typeQuestionLabel.value))
          } else {
            fd.append('typeQuestion', Number(this.selectedQuestionToEdit.typeQuestion))
          }
          if (this.selectedQuestionToEdit.categoryQuestionLabel.constructor === Object) {
            fd.append('categoryQuestion', this.selectedQuestionToEdit.categoryQuestionLabel.value)
          } else {
            fd.append('categoryQuestion', Number(this.selectedQuestionToEdit.categoryQuestion))
          }
          axios.post(vars.api_base + '/api/PsychologicalAssay/UpdateHanaQuestion', fd).then(response => {
            console.log(response)
            if (response.data.isSuccess) {
              this.getAllQuestion()
              this.selectedQuestionToEdit = {
                title: '',
                typeQuestion: null,
                soundQuestion: '',
                soundFailed: '',
                index: null,
                categoryQuestion: null,
                tryNumber: null,
                time: null,
                examName: '',
                rowCount: null,
                showTime: false,
                height: null,
                width: null,
              }
              this.createQuestionData.url_img = ''
              this.chosenSound = {}
              this.chosenFailedSound = {}
              this.UpdateLoading = false
              this.$q.notify({
                type: 'positive',
                message: 'سوال با موفقیت بروزرسانی شد.'
              })
              this.editDialog = !this.editDialog
            } else {
              this.UpdateLoading = false
              this.$q.notify({
                type: 'negative',
                message: response.data.exceptions[0].exception.persianDescription
              })
            }
          }).catch(error => {
            console.log(error)
            this.UpdateLoading = false
            this.$q.notify({
              type: 'negative',
              message: 'مشکلی پیش آمد.'
            })
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'ترتیب سوال تکراری است.'
          })
          this.UpdateLoading = false
        }
      }
    },
    deleteQuestion (question) {
      axios.post(vars.api_base + '/api/PsychologicalAssay/DeleteHanaQuestion', {
        id: question.id
      }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'سوال با موفقیت حذف شد.'
          })
          this.getAllQuestion()
        }
      }).catch(error => {
        console.log(error)
      })
    },
    uploadImages (file) {
      this.numOfUploadedImages = file.target.files.length
      for (let i = 0; i < this.numOfUploadedImages; i++) {
        this.images.push({
          width: null,
          height: null
        })
      }
    }
  },
  created() {
    this.getAllQuestion()
  }
})
</script>

<style lang="scss" scoped>
.questions-container {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    display: inline-block;
    margin-top: 1rem;
  }

  .create-question-wrapper {
    margin-top: 2rem;

    .second-input {
      margin-left: 1rem;

      @media (max-width: 1024px) {
        margin-left: 0;
      }
    }
  }

  .existing-questions {

  }
}

.label {
  font-size: 1rem;
  display: inline-block;
  margin-bottom: .5rem;
}
</style>
