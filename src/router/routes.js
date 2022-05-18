
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/category',
    children: [
      { name: 'tests', path: '/tests', component: () => import('pages/PsychologyTests/Tests.vue') },
      { name: 'questions', path: '/questions', component: () => import('pages/PsychologyTests/Questions') },
      { name: 'answers', path: '/answers', component: () => import('pages/PsychologyTests/Answers') },
      { name: 'analysis', path: '/analysis', component: () => import('pages/PsychologyTests/Analysis') },
      { name: 'wiscQuestions', path: '/wisc-questions', component: () => import('pages/WiscTest/Questions.vue') },
      { name: 'wiscAnswers', path: '/wisc-answers', component: () => import('pages/WiscTest/Answers.vue') },
      { name: 'countries', path: '/countries', component: () => import('pages/IranianMerchant/Country.vue') },
      { name: 'states', path: '/states', component: () => import('pages/IranianMerchant/State.vue') },
      { name: 'category', path: '/category', component: () => import('pages/PsychologyTests/Category.vue') },
      { name: 'tags', path: '/tags', component: () => import('pages/PsychologyTests/Tags.vue') },
      { name: 'comments', path: '/comments', component: () => import('pages/PsychologyTests/Comment') }
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
