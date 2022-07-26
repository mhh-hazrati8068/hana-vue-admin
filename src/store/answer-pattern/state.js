export default function () {
  return {
    patterns: [
      {
        label: 'دو گزینه\u200Cای',
        value: 2,
        options: [
          { label: 'بله', score: 1 },
          { label: 'خیر', score: 0 }
        ]
      },
      { label: 'سه گزینه\u200Cای',
        value: 3,
        options: [
          { label: 'زیاد', score: 2 },
          { label: 'متوسط', score: 1 },
          { label: 'کم', score: 0 }
        ]
      },
      { label: 'چهار گزینه\u200Cای',
        value: 4,
        options: [
          { label: 'زیاد', score: 3 },
          { label: 'متوسط', score: 2 },
          { label: 'کم', score: 1 },
          { label: 'نظری ندارم', score: 0 }
        ]
      },
      { label: 'پنج گزینه\u200Cای',
        value: 5,
        options: [
          { label: 'کاملا موافقم', score: 4 },
          { label: 'موافقم', score: 3 },
          { label: 'خنثی', score: 2 },
          { label: 'مخالفم', score: 1 },
          { label: 'کاملا مخالفم', score: 0 }
        ]
      }
    ]
  }
}
