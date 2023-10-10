<template>
  <div class="container">
    <!-- Toggle Buttons -->
    <div class="btn-container">
      <div @click="toggleVisibility('showTests')" class="checkbox-container">
        <div :class="{ 'checkbox-checked': showTests, 'checkbox-unchecked': !showTests }"></div>
        <label class="checkbox-label">تست ها</label>
      </div>
      <div @click="toggleVisibility('showQuestions')" class="checkbox-container">
        <div :class="{ 'checkbox-checked': showQuestions, 'checkbox-unchecked': !showQuestions }"></div>
        <label class="checkbox-label">سوال ها</label>
      </div>
      <div @click="toggleVisibility('showAnswers')" class="checkbox-container">
        <div :class="{ 'checkbox-checked': showAnswers, 'checkbox-unchecked': !showAnswers }"></div>
        <label class="checkbox-label">پاسخ ها</label>
      </div>
    </div>

    <!-- Render Components based on visibility -->
    <div class="component-container">
      <!-- for toggle thingd in vue you can use v-if v-else v-else-if -->
      <Tests v-if="showTests"></Tests>
      <Questions v-if="showQuestions"></Questions>
      <Answers v-if="showAnswers"></Answers>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Tests from "./Tests.vue";
import Questions from "./Questions.vue";
import Answers from "./Answers.vue";

export default defineComponent({
  name: "TestPage",
  components: {
    Tests,
    Questions,
    Answers,
  },
  data() {
    return {
      showTests: true,
      showQuestions: true,
      showAnswers: true,
    };
  },
  methods: {
    toggleVisibility(property) {
      // Toggle the visibility based on the current state
      this[property] = !this[property];
    },
  },
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.btn-container {
  padding: 0.5rem;
  display: flex;
  // flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-checked {
  width: 20px;
  height: 20px;
  background-color: $info; /* Checked color */
  border: 1px solid #b3b3b3;
  border-radius: 3px;
  margin-right: 10px;
}

.checkbox-unchecked {
  width: 20px;
  height: 20px;
  background-color: $white;
  border: 1px solid #b3b3b3;
  border-radius: 3px;
  margin-right: 10px;
}

.checkbox-label {
  font-size: 16px;
  flex: 1; /* Allow the label to take up available space */
}

.component-container {
  width: 100%;
}
</style>
