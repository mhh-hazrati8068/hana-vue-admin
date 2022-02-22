
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/tests',
    children: [
      { name: 'tests', path: '/tests', component: () => import('pages/PsychologyTests/Tests.vue') },
      { name: 'questions', path: '/questions', component: () => import('pages/PsychologyTests/Questions') },
      { name: 'answers', path: '/answers', component: () => import('pages/PsychologyTests/Answers') },
      { name: 'analysis', path: '/analysis', component: () => import('pages/PsychologyTests/Analysis') },
      { name: 'wiscQuestions', path: '/wisc-questions', component: () => import('pages/WiscTest/Questions.vue') },
      { name: 'wiscAnswers', path: '/wisc-answers', component: () => import('pages/WiscTest/Answers.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
