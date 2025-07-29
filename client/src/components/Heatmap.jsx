import React from 'react';
import moment from 'moment';

const getStreakDates = (streak) => {
  const dates = new Set();
  for (let i = 0; i < streak; i++) {
    dates.add(moment().subtract(i, 'days').format('YYYY-MM-DD'));
  }
  return dates;
};

const Heatmap = ({ streak = 7 }) => {
  const today = moment();
  const startDate = today.clone().subtract(11, 'months').startOf('month');
  const streakDates = getStreakDates(streak);

  const months = [];
  let currentMonth = startDate.clone();

  while (currentMonth.isSameOrBefore(today, 'month')) {
    const daysInMonth = currentMonth.daysInMonth();
    const firstDayOfWeek = currentMonth.clone().startOf('month').day(); // Sunday=0

    const days = [];

    // Add leading empty slots for alignment (before 1st of the month)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(currentMonth.clone().date(d));
    }

    months.push({
      name: currentMonth.format('MMMM'),
      days,
    });

    currentMonth.add(1, 'month');
  }

  return (
    <div className="overflow-auto max-w-full px-2 py-4">
      <div className="flex gap-6 flex-wrap">
        {months.map((month, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-1 text-gray-600">
              {month.name}
            </div>
            <div className="grid grid-cols-7 gap-[2px]">
              {month.days.map((day, i) => {
                const dateStr = day ? day.format('YYYY-MM-DD') : '';
                const isStreak = streakDates.has(dateStr);
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${
                      !day
                        ? 'bg-transparent'
                        : isStreak
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
