<template>
  <div class="questions-container">
<!--    <div class="row">
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
    </div>-->
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
    <div class="existing-questions">
      <div class="row">
        <div class="col-12">
          <span class="title">سوال&zwnj;های موجود</span>
        </div>
        <div class="col-12">
          <q-table
            :columns="columns"
            :rows="questions"
            class="q-mt-lg"
            v-model:pagination="pagination"
            :loading="loading"
            @request="getAllQuestion"
            :rows-per-page-options="[10,20,30,40,50]"
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
                    v-if="col.field === 'showAnswers'"
                    unelevated
                    dense
                    @click="goToAnswer(props.row.id)"
                    label="مشاهده پاسخ"
                    color="primary"
                    class="button"
                  />
                  <q-btn
                    v-if="col.field === 'updateImages'"
                    unelevated
                    dense
                    label="ویرایش تصاویر"
                    color="primary"
                    class="button"
                    @click="openUpdateImagesDialog(props.row)"
                  />
                  <q-btn
                    v-if="col.field === 'edit'"
                    unelevated
                    dense
                    round
                    icon="edit"
                    class="edit-btn"
                    @click="openEditDialog(props.row)"
                    title="ویرایش"
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
                    title="حذف"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
        <div class="col-12 flex justify-end">
          <q-btn
            unelevated
            dense
            label="افزودن سوال"
            icon-right="add"
            color="primary"
            class="btn q-mt-md"
            @click="createDialog = !createDialog"
          />
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
            <div class="input second-input">
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
              <div v-if="selectedQuestionToEdit.soundQuestion !== null">
                <q-file
                  v-model="chosenSound"
                  v-show="false"
                  outlined
                  dense
                  @input="onDocumentPicked($event)"
                  ref="file1"
                />
                <q-input
                  dense
                  outlined
                  v-model="selectedQuestionToEdit.soundQuestion[0].url"
                  readonly
                />
                <q-btn
                  unelevated
                  dense
                  color="primary"
                  label="تغییر فایل صوتی"
                  class="q-mt-md full-width"
                  @click="changeFile1"
                />
                <span class="q-pt-sm block">{{ chosenSound.name }}</span>
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
            <div class="input second-input">
              <span class="label"> فایل صوتی در صورت عدم موفقیت</span>
              <div v-if="selectedQuestionToEdit.mediaFailed !== null">
                <q-file
                  v-show="false"
                  v-model="chosenFailedSound"
                  outlined
                  dense
                  @input="onFailedDocumentPicked($event)"
                  ref="file2"
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
                  @click="changeFile2"
                />
                <span class="q-pt-sm block">{{ chosenFailedSound.name }}</span>
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
            <div class="input second-input">
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
            <div class="input second-input">
              <span class="label">ترتیب (index)</span>
              <q-input
                v-model="selectedQuestionIndex"
                outlined
                dense
                type="number"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 q-mt-md">
            <div class="input">
              <span class="label">تعداد سطر</span>
              <q-input
                v-model="selectedQuestionToEdit.rows"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <q-checkbox
              v-model="selectedQuestionToEdit.showTimer"
              label="نمایش زمان"
              style="font-size: 1rem"
            />
          </div>
<!--          <div class="col-12 q-mt-md">
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
            </div>-->
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
<!--          <div class="col-12">
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
          </div>-->
          <div class="col-12 q-mt-lg flex justify-center">
            <q-btn
              unelevated
              dense
              label="ثبت"
              color="primary"
              class="submit-btn"
              @click="updateQuestion"
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
        <div class="text-h6">افزودن سوال</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row">
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
                <div class="col-12 q-mt-md">
                  <div class="input">
                    <span class="label">فایل تصویری (ترتیب انتخاب عکس مهم میباشد)</span>
                    <q-file
                      v-model="createQuestionData.image"
                      outlined
                      dense
                      multiple
                      @input="uploadImages($event)"
                    />
                  </div>
                </div>
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
                      <div class="input second-input">
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
                    <div class="col-12 col-md-6 q-mt-md">
                      <div class="input">
                        <span class="label">موقعیت افقی</span>
                        <q-input
                          v-model="images[index].locationX"
                          outlined
                          dense
                          type="number"
                          min="0"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-md-6 q-mt-md">
                      <div class="input second-input">
                        <span class="label">موقعیت عمودی</span>
                        <q-input
                          v-model="images[index].locationY"
                          outlined
                          dense
                          type="number"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 flex justify-center q-mt-lg">
                  <q-btn
                    unelevated
                    dense
                    label="ثبت سوال"
                    color="primary"
                    class="submit-btn"
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
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="updateImagesDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">ویرایش تصاویر</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="image q-mb-sm" v-for="(image, index) in selectedQuestionToEdit.videoQuestion" :key="index">
          <div class="row">
            <div class="col-3">
              <img src="~assets/images/fargo.svg" style="margin-top: 1.75rem">
            </div>
            <div class="col-9">
              <div class="flex column">
                <div class="input-wrapper">
                  <div class="">
                    <span class="label">موقعیت افقی</span>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="image.locationX"
                    />
                  </div>
                  <div class="q-ml-sm">
                    <span class="label">موقعیت عمودی</span>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="image.locationY"
                    />
                  </div>
                </div>
                <div class="input-wrapper q-mt-sm">
                  <div class="">
                    <span class="label">طول</span>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="image.height"
                    />
                  </div>
                  <div class="q-ml-sm">
                    <span class="label">عرض</span>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="image.width"
                    />
                  </div>
                </div>
                <q-file
                  v-show="false"
                  v-model="changedImage"
                  :ref="`index`"
                  @update:model-value="addNewImage(index)"
                />
                <q-btn
                  unelevated
                  dense
                  label="تغییر عکس"
                  color="primary"
                  class="q-mt-md"
                  @click="changeImage(index)"
                />
                <span class="q-pt-sm block" v-if="changedImages[index]">{{ changedImages[index].name }}</span>
              </div>
            </div>
          </div>
          <q-separator class="q-mt-sm"/>
        </div>
        <q-btn
          unelevated
          dense
          label="اعمال تغییرات"
          color="primary"
          class="submit-btn"
          @click="updateQuestionImages"
        />
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
        image: {},
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
        { name: 'updateImages', align: 'center', label: '', field: 'updateImages' },
        { name: 'showAnswers', align: 'center', label: '', field: 'showAnswers' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },
      answers: [],
      editDialog: false,
      selectedQuestionToEdit: {},
      selectedQuestionIndex: null,
      numOfUploadedImages: 0,
      images: [],
      isLoading: false,
      updateLoading: false,
      createDialog: false,
      search: '',
      updateImagesDialog: false,
      changedImage: {},
      changedImages: [],
      loading: false,
      qBody: {
        take: 20,
        skip: 0
      },
    }
  },
  methods: {
    setQuestion () {
      const today = new Date().toISOString().slice(0, 10)
      this.isLoading = true
      let isReiterativeIndex = false;
      for (let i = 0; i < this.questions.length; i++) {
        if (this.questions[i].index === Number(this.createQuestionData.index)) {
          isReiterativeIndex = true
        }
      }
      let soundQuestion = [], mediaFailed = []
      let videoQuestion = []
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
              fd.append('soundQuestion', JSON.stringify(soundQuestion))
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
          fd.append('date', today)

          let data = {
            title: this.createQuestionData.title,
            typeQuestion: Number(this.createQuestionData.typeQuestion.value),
            index: this.createQuestionData.index,
            categoryQuestion: Number(this.createQuestionData.categoryQuestion.value),
            tryNumber: this.createQuestionData.tryNumber,
            time: this.createQuestionData.time,
            examName: this.createQuestionData.examName.label,
            rows: this.createQuestionData.rows,
            showTimer: this.createQuestionData.showTimer,
            date: today
          }

          if (Object.keys(this.createQuestionData.image).length !== 0) {
            for (let i = 0; i < this.numOfUploadedImages; i++) {
              if (this.createQuestionData.image[i].type === 'image/png' || this.createQuestionData.image[i].type === 'image/jpeg') {
                videoQuestion[i] = {
                  url: this.createQuestionData.image[i].__key,
                  height: Number(this.images[i].height),
                  width: Number(this.images[i].width),
                  locationX: Number(this.images[i].locationX),
                  locationY: Number(this.images[i].locationY)
                }
              }
            }
            data = {
              videoQuestion: videoQuestion,
              ...data
            }
          }

          if (Object.keys(this.chosenSound).length !== 0) {
            soundQuestion = [{
              url: this.chosenSound.__key
            }]
            data = {
              soundQuestion: soundQuestion,
              ...data
            }
          }
          if (Object.keys(this.chosenFailedSound).length !== 0) {
            mediaFailed = [{
              url: this.chosenFailedSound.__key
            }]
            data = {
              mediaFailed: mediaFailed,
              ...data
            }
          }

          axios.post(vars.api_base + '/Questions/CreateQuestion', data).then(response => {
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
              this.createDialog = false
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
    getAllQuestion (reqProps) {
      this.loading = true
      this.qBody.take = reqProps?.pagination.rowsPerPage ?? 20
      this.qBody.skip = reqProps ? (reqProps?.pagination.page - 1) * this.qBody.take : 0
      this.pagination.rowsPerPage = this.qBody.take
      axios.post(vars.api_base + '/Answer/GetAnswers', {
        searchQuery: null,
        index: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {},
        fromDateTime: null,
        toDateTime: null
      }).then(response => {
        this.answers = response.data.items
      }).catch(error => {
        console.log(error)
      })
      axios.post(vars.api_base + '/Questions/GetQuestions', {
        searchQuery: null,
        index: null,
        take: this.qBody.take,
        skip: this.qBody.skip,
        isExportFile: false,
        exportColumns: {},
        fromDateTime: null,
        toDateTime: null
      }).then(response => {
        // console.log(response.data)
        this.pagination.rowsNumber = response.data.count
        this.pagination.page = reqProps?.pagination.page ?? 1
        this.questions = response.data.items.sort((a, b) => {
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
      }).then(() => {
        this.loading = false
      })
    },
    openEditDialog (question) {
      this.editDialog = !this.editDialog
      this.selectedQuestionToEdit = question
      // console.log(this.selectedQuestionToEdit)
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
      this.updateLoading = true
      let isReiterativeIndex = false;
      const today = new Date().toISOString().slice(0, 10)
      let sound = [], failed = []

      for (let i = 0; i < this.questions.length; i++) {
        if (this.selectedQuestionToEdit.index !== this.selectedQuestionIndex) {
          if (this.questions[i].index === Number(this.selectedQuestionIndex)) {
            isReiterativeIndex = true
          }
        }
      }

      let fd = new FormData()
      let newIndex
      let newTypeQuestion
      let newCategoryQuestion
      if (!this.selectedQuestionToEdit.title || !this.selectedQuestionToEdit.typeQuestionLabel || !this.selectedQuestionToEdit.index ||
        !this.selectedQuestionToEdit.categoryQuestionLabel || !this.selectedQuestionToEdit.tryNumber ||
        !this.selectedQuestionToEdit.time) {
        this.$q.notify({
          type: 'negative',
          message: 'لطفا مقادیر ضروری را وارد کنید.'
        })
        this.updateLoading = false
      } else {
        if (!isReiterativeIndex) {
          if (Object.keys(this.chosenSound).length !== 0) {
            if (this.chosenSound.type === 'audio/mpeg') {
              fd.append('mediaQuestion', JSON.stringify(this.selectedQuestionToEdit.mediaQuestion))
              fd.append('files', this.chosenSound)
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل صوتی به درستی انتخاب نشده است.'
              })
              this.updateLoading = false
              return false
            }
          }
          if (Object.keys(this.chosenFailedSound).length !== 0) {
            if (this.chosenFailedSound.type === 'audio/mpeg') {
              fd.append('mediaFailed', JSON.stringify(this.selectedQuestionToEdit.mediaFailed))
              fd.append('files', this.chosenFailedSound)
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل صوتی به درستی انتخاب نشده است.'
              })
              this.updateLoading = false
              return false
            }
          }
          /*for (let i = 1; i <= this.numOfUploadedImages; i++) {
            console.log(this.createQuestionData.url_img[i-1])
            if (this.createQuestionData.url_img[i-1].type === 'image/png' || this.createQuestionData.url_img[i-1].type === 'image/jpeg') {
              fd.append('files', this.createQuestionData.url_img[i-1])
              if (this.selectedQuestionToEdit.mediaQuestion[0]) {
                this.selectedQuestionToEdit.mediaQuestion[i] = {
                  Url: this.createQuestionData.url_img[i-1].__key,
                  Height: Number(this.images[i-1].height),
                  Width: Number(this.images[i-1].width)
                }
              } else {
                this.selectedQuestionToEdit.mediaQuestion[i-1] = {
                  Url: this.createQuestionData.url_img[i-1].__key,
                  Height: Number(this.images[i-1].height),
                  Width: Number(this.images[i-1].width)
                }
              }
            } else {
              this.$q.notify({
                type: 'negative',
                message: 'فایل تصویری به درستی انتخاب نشده است.'
              })
              this.UpdateLoading = false
            }
          }*/
          fd.append('title', this.selectedQuestionToEdit.title)
          if (this.selectedQuestionToEdit.index !== this.selectedQuestionIndex) {
            fd.append('index', this.selectedQuestionIndex)
            newIndex = Number(this.selectedQuestionIndex)
          } else {
            fd.append('index', this.selectedQuestionToEdit.index)
            newIndex = Number(this.selectedQuestionToEdit.index)
          }
          fd.append('tryNumber', Number(this.selectedQuestionToEdit.tryNumber))
          fd.append('time', Number(this.selectedQuestionToEdit.time))
          fd.append('examName', this.selectedQuestionToEdit.examName)
          fd.append('rows', this.selectedQuestionToEdit.rows)
          fd.append('showTimer', this.selectedQuestionToEdit.showTimer)
          fd.append('id', this.selectedQuestionToEdit.id)
          if (this.selectedQuestionToEdit.typeQuestionLabel.constructor === Object) {
            fd.append('typeQuestion', Number(this.selectedQuestionToEdit.typeQuestionLabel.value))
            newTypeQuestion = Number(this.selectedQuestionToEdit.typeQuestionLabel.value)
          } else {
            fd.append('typeQuestion', Number(this.selectedQuestionToEdit.typeQuestion))
            newTypeQuestion = Number(this.selectedQuestionToEdit.typeQuestion)
          }
          if (this.selectedQuestionToEdit.categoryQuestionLabel.constructor === Object) {
            fd.append('categoryQuestion', this.selectedQuestionToEdit.categoryQuestionLabel.value)
            newCategoryQuestion = Number(this.selectedQuestionToEdit.categoryQuestionLabel.value)
          } else {
            fd.append('categoryQuestion', Number(this.selectedQuestionToEdit.categoryQuestion))
            newCategoryQuestion = Number(this.selectedQuestionToEdit.categoryQuestion)
          }
          let data = {
            title: this.selectedQuestionToEdit.title,
            index: newIndex,
            tryNumber: Number(this.selectedQuestionToEdit.tryNumber),
            time: Number(this.selectedQuestionToEdit.time),
            examName: this.selectedQuestionToEdit.examName,
            rows: Number(this.selectedQuestionToEdit.rows),
            showTimer: this.selectedQuestionToEdit.showTimer,
            id: this.selectedQuestionToEdit.id,
            typeQuestion: newTypeQuestion,
            categoryQuestion: newCategoryQuestion,
            date: today,
            videoQuestion: this.selectedQuestionToEdit.videoQuestion
          }

          if (Object.keys(this.chosenSound).length !== 0) {
            sound = [{
              url: this.chosenSound.__key
            }]
            data = {
              soundQuestion: sound,
              ...data
            }
          } else {
            data = {
              soundQuestion: this.selectedQuestionToEdit.soundQuestion,
              ...data
            }
          }
          if (Object.keys(this.chosenFailedSound).length !== 0) {
            failed = [{
              url: this.chosenFailedSound.__key
            }]
            data = {
              mediaFailed: failed,
              ...data
            }
          } else {
            data = {
              mediaFailed: this.selectedQuestionToEdit.mediaFailed,
              ...data
            }
          }

          axios.put(vars.api_base + '/Questions/UpdateQuestion', data).then(response => {
            // console.log(response)
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
                rowCount: null,
                showTime: false,
                height: null,
                width: null,
              }
              this.createQuestionData.url_img = ''
              this.chosenSound = {}
              this.chosenFailedSound = {}
              this.updateLoading = false
              this.$q.notify({
                type: 'positive',
                message: 'سوال با موفقیت بروزرسانی شد.'
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
            this.updateLoading = false
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
          this.updateLoading = false
        }
      }
    },
    deleteQuestion (question) {
      /*const payload = {
        id: question.id
      }*/
      axios.delete(vars.api_base + `/Questions/DeleteQuestion?id=${question.id}`).then(response => {
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
          height: null,
          locationX: null,
          locationY: null
        })
      }
    },
    goToAnswer(id) {
      this.$router.push({
        name: 'wiscAnswers',
        query: { questionId: id }
      })
    },
    changeFile1() {
      this.$refs.file1.pickFiles()
    },
    changeFile2() {
      this.$refs.file2.pickFiles()
    },
    changeImage(index) {
      for (let i = 0; i < this.$refs.index.length; i++) {
        if (i === index) {
          this.$refs.index[index].pickFiles()
        }
      }
    },
    addNewImage (index) {
      this.changedImages[index] = this.changedImage
      this.selectedQuestionToEdit.videoQuestion[index].url = this.changedImage.__key
    },
    openUpdateImagesDialog(question) {
      this.selectedQuestionToEdit = question
      console.log(this.selectedQuestionToEdit.videoQuestion)
      this.updateImagesDialog = !this.updateImagesDialog
    },
    updateQuestionImages () {
      for (let i = 0; i < this.selectedQuestionToEdit.videoQuestion.length; i++) {
        this.selectedQuestionToEdit.videoQuestion[i] = {
          url: this.selectedQuestionToEdit.videoQuestion[i].url,
          height: Number(this.selectedQuestionToEdit.videoQuestion[i].height),
          width: Number(this.selectedQuestionToEdit.videoQuestion[i].width),
          locationX: Number(this.selectedQuestionToEdit.videoQuestion[i].locationX),
          locationY: Number(this.selectedQuestionToEdit.videoQuestion[i].locationY)
        }
      }
      axios.put(vars.api_base + '/Questions/UpdateQuestion', this.selectedQuestionToEdit).then(response => {
        if (response.data.isSuccess) {
          this.updateImagesDialog = !this.updateImagesDialog
          this.changedImages = []
          this.$q.notify({
            type: 'positive',
            message: 'تصاویر با موفقیت بروزرسانی شدند.'
          })
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
      axios.post(vars.api_base + '/Questions/GetQuestions', {
        searchQuery: this.search,
        index: null,
        take: null,
        skip: null,
        isExportFile: false,
        exportColumns: {},
        fromDateTime: null,
        toDateTime: null
      }).then(response => {
        this.questions = response.data.items.sort((a, b) => {
          return a.index - b.index
        })
      }).catch(error => {
        console.log(error)
      })
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
  }
}
</style>
