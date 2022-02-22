<template>
  <div class="answers-container">
    <div class="row">
      <div class="col-12">
        <span class="title">افزودن پاسخ</span>
      </div>
      <div class="col-12">
        <div class="create-answer-wrapper">
          <div class="row">
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">عنوان پاسخ</span>
                <q-input
                  v-model="createAnswerData.title"
                  outlined
                  dense
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">انتخاب سوال</span>
                <q-select
                  v-model="createAnswerData.questionId"
                  outlined
                  dense
                  :options="questions"
                  :option-value="'id'"
                  :option-label="'title'"
                  @update:model-value="getAnswerOptions"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">بارگذاری تصویر پاسخ</span>
                <q-file
                  v-model="createAnswerData.img"
                  outlined
                  dense
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">موقعیت افقی</span>
                <q-input
                  v-model="createAnswerData.location_x"
                  outlined
                  dense
                  type="number"
                  :disable="Object.keys(createAnswerData.img).length === 0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">موقعیت عمودی</span>
                <q-input
                  v-model="createAnswerData.location_y"
                  outlined
                  dense
                  type="number"
                  :disable="Object.keys(createAnswerData.img).length === 0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">امتیاز پاسخ</span>
                <q-input
                  v-model="createAnswerData.answerPoint"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">ارتفاع</span>
                <q-input
                  v-model="createAnswerData.height"
                  outlined
                  dense
                  type="number"
                  min="0"
                  :disable="Object.keys(createAnswerData.img).length === 0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input second-input">
                <span class="label">عرض</span>
                <q-input
                  v-model="createAnswerData.width"
                  outlined
                  dense
                  type="number"
                  min="0"
                  :disable="Object.keys(createAnswerData.img).length === 0"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">تطابق با پاسخ&zwnj;های موجود</span>
                <q-select
                  v-model="createAnswerData.matchWith"
                  outlined
                  dense
                  :options="answersOptions"
                  :option-label="'title'"
                  :option-value="'id'"
                  multiple
                  :disable="createAnswerData.questionId === '' ||
                            Object.keys(answersOptions).length === 0"
                />
              </div>
            </div>
<!--            <div class="col-12 col-md-6 q-mt-md">
              <div class="input">
                <span class="label">بارگذاری فایل صوتی</span>
                <q-file
                  v-model="createAnswerData.soundQuestion"
                  outlined
                  dense
                />
              </div>
            </div>-->
            <div class="col-12 flex justify-end q-mt-lg">
              <q-btn
                unelevated
                dense
                label="ثبت"
                color="primary"
                style="width: 15%"
                @click="setAnswer"
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
    <div class="existing-answers">
      <div class="row">
        <div class="col-12">
          <span class="title">پاسخ&zwnj;های موجود</span>
        </div>
        <div class="col-12">
          <q-table
            :pagination="pagination"
            :columns="columns"
            :rows="answers"
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
        <div class="text-h6">ویرایش پاسخ</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">عنوان پاسخ</span>
              <q-input
                v-model="selectedAnswerToEdit.title"
                outlined
                dense
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label">بارگذاری تصویر پاسخ</span>
              <div v-if="selectedAnswerToEdit.mediaAnswer !== null">
                <q-file
                  v-show="false"
                  v-model="newImage.img"
                  outlined
                  dense
                  ref="answerImage"
                />
                <q-input
                  dense
                  outlined
                  v-model="selectedAnswerToEdit.mediaAnswer[0].fileName"
                  readonly
                />
                <q-btn
                  unelevated
                  dense
                  label="تعویض تصویر"
                  color="primary"
                  class="full-width q-mt-md"
                  @click="changeImage"
                />
              </div>
              <div v-else>
                <q-file
                  v-model="newImage.img"
                  outlined
                  dense
                  ref="answerImage"
                />
              </div>
            </div>
          </div>
          <div class="col-12" v-if="selectedAnswerToEdit.mediaAnswer !== null">
            <div class="row">
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input">
                  <span class="label">موقعیت افقی</span>
                  <q-input
                    v-model="newImage.location_x"
                    outlined
                    dense
                    type="number"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input q-ml-sm">
                  <span class="label">موقعیت عمودی</span>
                  <q-input
                    v-model="newImage.location_y"
                    outlined
                    dense
                    type="number"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input">
                  <span class="label">ارتفاع</span>
                  <q-input
                    v-model="newImage.height"
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
                    v-model="newImage.width"
                    outlined
                    dense
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12" v-else>
            <div class="row">
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input">
                  <span class="label">موقعیت افقی</span>
                  <q-input
                    v-model="newImage.location_x"
                    outlined
                    dense
                    type="number"
                    :disable="Object.keys(newImage.img).length === 0"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input q-ml-sm">
                  <span class="label">موقعیت عمودی</span>
                  <q-input
                    v-model="newImage.location_y"
                    outlined
                    dense
                    type="number"
                    :disable="Object.keys(newImage.img).length === 0"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input">
                  <span class="label">ارتفاع</span>
                  <q-input
                    v-model="newImage.height"
                    outlined
                    dense
                    type="number"
                    min="0"
                    :disable="Object.keys(newImage.img).length === 0"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6 q-mt-md">
                <div class="input  q-ml-sm">
                  <span class="label">عرض</span>
                  <q-input
                    v-model="newImage.width"
                    outlined
                    dense
                    type="number"
                    min="0"
                    :disable="Object.keys(newImage.img).length === 0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input second-input">
              <span class="label">امتیاز پاسخ</span>
              <q-input
                v-model="selectedAnswerToEdit.answerPointPure"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input q-ml-sm">
              <span class="label">تطابق با پاسخ&zwnj;های موجود</span>
              <q-select
                v-model="selectedAnswerToEdit.matchWith"
                outlined
                dense
                :options="selectedAnswerOptions"
                :option-label="'title'"
                :option-value="'id'"
                multiple
                :disable="Object.keys(selectedAnswerOptions).length === 0"
              />
            </div>
          </div>
          <div class="col-12 flex justify-center q-mt-lg">
            <q-btn
              unelevated
              dense
              label="ثبت"
              color="primary"
              style="width: 20%"
              @click="updateAnswer"
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
import { defineComponent } from "vue";
import vars from "src/vars";
import * as axios from "axios";

export default defineComponent({
  name: 'Answers',
  data () {
    return {
      createAnswerData: {
        title: '',
        questionId: '',
        img: {},
        soundAnswer: '',
        location_x: null,
        location_y: null,
        answerPoint: null,
        height: null,
        width: null,
        matchWith: []
      },
      answers: [],
      columns: [
        { name: 'title', align: 'center', label: 'عنوان پاسخ', field: 'title' },
        { name: 'answerPointPure', align: 'center', label: 'امتیاز پاسخ', field: 'answerPointPure' },
        { name: 'edit', align: 'center', label: '', field: 'edit' },
        { name: 'delete', align: 'center', label: '', field: 'delete' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      questions: [],
      editDialog: false,
      selectedAnswerToEdit: {},
      isLoading: false,
      answersOptions: [],
      newImage: {
        img: {},
        location_x: null,
        location_y: null,
        height: null,
        width: null
      },
      selectedAnswerOptions: [],
      updateLoading: false
    }
  },
  methods: {
    setAnswer () {
      this.isLoading = true
      let mediaAnswer = []
      if (Object.keys(this.createAnswerData.img).length !== 0) {
        mediaAnswer = [
          {
            Url: this.createAnswerData.img.__key,
            Height: Number(this.createAnswerData.height),
            Width: Number(this.createAnswerData.width),
            LocationX: Number(this.createAnswerData.location_x),
            LocationY: Number(this.createAnswerData.location_y)
          }
        ]
      } else {
        mediaAnswer = null
      }
      const match = []
      for (let i = 0; i < this.createAnswerData.matchWith.length; i++) {
        match.push(this.createAnswerData.matchWith[i].id)
      }
      let fd = new FormData()
      if (this.createAnswerData.questionId !== '') {
        fd.append('files', this.createAnswerData.img)
        fd.append('title', this.createAnswerData.title)
        fd.append('questionId', this.createAnswerData.questionId.id)
        if (mediaAnswer !== null) {
          fd.append('mediaAnswer', JSON.stringify(mediaAnswer))
        }
        fd.append('answerPointPure', Number(this.createAnswerData.answerPoint))
        fd.append('matchWith', JSON.stringify(match))
        // console.log(this.createAnswerData)
        axios.post(vars.api_base + '/api/PsychologicalAssay/UploadAnswer', fd).then(response => {
          console.log(response)
          if (response.data.isSuccess) {
            this.getAllAnswers()
            this.createAnswerData = {
              title: '',
              questionId: null,
              img: '',
              soundAnswer: '',
              location_x: null,
              location_y: null,
              answerPoint: null,
              height: null,
              width: null,
              matchWith: []
            }
            this.isLoading = false
            this.$q.notify({
              type: 'positive',
              message: 'پاسخ جدید با موفقیت اضافه شد.'
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
          this.isLoading = false
          this.$q.notify({
            type: 'negative',
            message: 'مشکلی پیش آمد.'
          })
        })
      } else {
        this.isLoading = false
        this.$q.notify({
          type: 'negative',
          message: 'لطفا سوال را انتخاب کنید.'
        })
      }
    },
    getAllAnswers () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetHanaAnswer').then(response => {
        this.answers = response.data.item
        // console.log(this.answers)
      }).catch(error => {
        console.log(error)
      })
    },
    openEditDialog (answer) {
      this.editDialog = !this.editDialog
      this.selectedAnswerToEdit = answer
      console.log(this.selectedAnswerToEdit)
      this.selectedAnswerOptions = this.answers.filter(answer => {
        return answer.questionId !== this.selectedAnswerToEdit.questionId
      }).filter(answer => {
        return answer.questionId === this.selectedAnswerToEdit.questionId
      })
      if (this.selectedAnswerToEdit.mediaAnswer !== null) {
        this.newImage.location_y = this.selectedAnswerToEdit.mediaAnswer[0].locationY
        this.newImage.location_x = this.selectedAnswerToEdit.mediaAnswer[0].locationX
        this.newImage.height = this.selectedAnswerToEdit.mediaAnswer[0].height
        this.newImage.width = this.selectedAnswerToEdit.mediaAnswer[0].width
      }
    },
    deleteQuestion (answer) {
      axios.post(vars.api_base + '/api/PsychologicalAssay/DeleteHanaAnswer', {
        id: answer.id
      }).then(response => {
        if (response.data.isSuccess) {
          this.$q.notify({
            type: 'info',
            message: 'پاسخ با موفقیت حذف شد.'
          })
          this.getAllAnswers()
        }
      })
    },
    getQuestions () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetHanaQuestion').then(response => {
        this.questions = response.data.item
      }).catch(error => {
        console.log(error)
      })
    },
    updateAnswer () {
      this.updateLoading = true
      let mediaAnswer
      console.log(this.newImage)
      if (Object.keys(this.newImage.img).length !== 0) {
        mediaAnswer = [
          {
            Url: this.newImage.img.__key,
            Height: Number(this.newImage.height),
            Width: Number(this.newImage.width),
            LocationX: Number(this.newImage.location_x),
            LocationY: Number(this.newImage.location_y)
          }
        ]
        console.log(mediaAnswer[0])
      } else {
        mediaAnswer = [
          {
            Url: this.selectedAnswerToEdit.mediaAnswer[0].url,
            Height: Number(this.newImage.height),
            Width: Number(this.newImage.width),
            LocationX: Number(this.newImage.location_x),
            LocationY: Number(this.newImage.location_y)
          }
        ]
        console.log(mediaAnswer[0])
      }
      this.selectedAnswerToEdit.mediaAnswer = mediaAnswer
      let match = []
      match = this.selectedAnswerToEdit.matchWith
      /*if (this.selectedAnswerToEdit.matchWith !== this.selectedAnswerToEdit.matchWith.id) {
        for (let i = 0; i < this.selectedAnswerToEdit.matchWith.length; i++) {
          match.push(this.selectedAnswerToEdit.matchWith[i])
        }
      }*/
      let fd = new FormData()
      fd.append('files', this.newImage.img)
      fd.append('title', this.selectedAnswerToEdit.title)
      fd.append('questionId', this.selectedAnswerToEdit.questionId)
      fd.append('mediaAnswer', JSON.stringify(mediaAnswer))
      fd.append('answerPointPure', Number(this.selectedAnswerToEdit.answerPointPure))
      fd.append('matchWith', JSON.stringify(match))
      fd.append('id', this.selectedAnswerToEdit.id)
      console.log(this.selectedAnswerToEdit)
      console.log(this.selectedAnswerToEdit.mediaAnswer[0])
      axios.post(vars.api_base + '/api/PsychologicalAssay/UpdateHanaAnswer', fd).then(response => {
        console.log(response)
        if (response.data.isSuccess) {
          this.getAllAnswers()
          this.updateLoading = false
          this.$q.notify({
            type: 'positive',
            message: 'پاسخ جدید با موفقیت اضافه شد.'
          })
          this.editDialog = !this.editDialog
        } else {
          this.updateLoading = false
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
        this.updateLoading = false
      })
    },
    changeImage () {
      this.$refs.answerImage.pickFiles()
    },
    getAnswerOptions () {
      axios.post(vars.api_base + '/api/PsychologicalAssay/GetHanaAnswer').then(response => {
        this.answersOptions = response.data.item.filter(answer => {
          return answer.questionId === this.createAnswerData.questionId.id
        })
      }).catch(error => {
        console.log(error)
      })
    },
  },
  created() {
    this.getAllAnswers()
    this.getQuestions()
  }
})
</script>

<style lang="scss" scoped>
.answers-container {
  padding: 1rem;

  .title {
    font-size: 1.1rem;
    display: inline-block;
    margin-top: 1rem;
  }

  .create-answer-wrapper {
    margin-top: 2rem;

    .label {
      font-size: 1rem;
      display: inline-block;
      margin-bottom: 1rem;
    }

    .second-input {
      margin-left: 1rem;

      @media (max-width: 1024px) {
        margin-left: 0;
      }
    }
  }
}

.label {
  font-size: 1rem;
  display: inline-block;
  margin-bottom: .5rem;
}
</style>
