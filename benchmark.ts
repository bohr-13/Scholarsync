const tasks = Array.from({ length: 10000 }).map((_, i) => ({
  id: String(i),
  title: `Task ${i}`,
  status: i % 2 === 0 ? 'completed' : 'pending',
  priority: i % 10 === 0 ? 'critical' : 'normal',
}));

const statsLoading = false;
const averageAttendance = 85;

function runUnoptimized() {
  const stats = [
    { label: 'Total Tasks', value: statsLoading ? '—' : String(tasks.length) },
    { label: 'Completed', value: statsLoading ? '—' : String(tasks.filter(t => t.status === 'completed').length) },
    { label: 'Upcoming', value: statsLoading ? '—' : String(tasks.filter(t => t.status !== 'completed').length) },
    { label: 'Avg Attendance', value: statsLoading ? '—' : `${averageAttendance}%` },
    { label: 'Critical Tasks', value: statsLoading ? '—' : String(tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length) },
  ];
  return stats;
}

function runOptimized() {
  let completed = 0;
  let upcoming = 0;
  let critical = 0;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (t.status === 'completed') {
      completed++;
    } else {
      upcoming++;
      if (t.priority === 'critical') {
        critical++;
      }
    }
  }

  const stats = [
    { label: 'Total Tasks', value: statsLoading ? '—' : String(tasks.length) },
    { label: 'Completed', value: statsLoading ? '—' : String(completed) },
    { label: 'Upcoming', value: statsLoading ? '—' : String(upcoming) },
    { label: 'Avg Attendance', value: statsLoading ? '—' : `${averageAttendance}%` },
    { label: 'Critical Tasks', value: statsLoading ? '—' : String(critical) },
  ];
  return stats;
}

console.log('Warming up...');
for (let i = 0; i < 100; i++) {
  runUnoptimized();
  runOptimized();
}

console.log('Running benchmark...');
const ITERS = 10000;

const startUnopt = performance.now();
for (let i = 0; i < ITERS; i++) {
  runUnoptimized();
}
const unoptTime = performance.now() - startUnopt;

const startOpt = performance.now();
for (let i = 0; i < ITERS; i++) {
  runOptimized();
}
const optTime = performance.now() - startOpt;

console.log(`Unoptimized: ${unoptTime.toFixed(2)} ms`);
console.log(`Optimized: ${optTime.toFixed(2)} ms`);
console.log(`Speedup: ${(unoptTime / optTime).toFixed(2)}x`);
