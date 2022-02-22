/*
export function someAction (context) {
}
*/

export function fetchPatterns (context) {
  const patterns = [
    { label: 'دو گزینه ای', value: 1 },
    { label: 'سه گزینه ای', value: 2 },
    { label: 'چهار گزینه ای', value: 3 },
    { label: 'پنج گزینه ای', value: 5 }
  ]
  context.commit('setPatterns', patterns)
}
