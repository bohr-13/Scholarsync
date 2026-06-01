const { performance } = require('perf_hooks');

const numTasks = 100000;
const tasks = Array.from({ length: numTasks }, (_, i) => ({
  status: i % 10 === 0 ? 'completed' : 'pending',
  priority: i % 5 === 0 ? 'critical' : 'normal',
  deadline: new Date(Date.now() + (Math.random() * 10 - 5) * 24 * 60 * 60 * 1000).toISOString()
}));

const emergency = { isActive: false };

function runUnoptimized() {
  const start = performance.now();
  const filteredTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;

    if (emergency.isActive) {
      return task.priority === 'critical' || task.priority === 'high';
    } else {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    }
  });
  return performance.now() - start;
}

function runOptimized() {
  const start = performance.now();
  const now = new Date();
  const nowTime = now.getTime();

  const filteredTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;

    if (emergency.isActive) {
      return task.priority === 'critical' || task.priority === 'high';
    } else {
      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - nowTime;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    }
  });
  return performance.now() - start;
}

// Warmup
for(let i=0; i<5; i++) {
  runUnoptimized();
  runOptimized();
}

let unoptTotal = 0;
let optTotal = 0;
const runs = 20;

for (let i = 0; i < runs; i++) {
  unoptTotal += runUnoptimized();
  optTotal += runOptimized();
}

console.log(`Unoptimized average: ${(unoptTotal / runs).toFixed(2)} ms`);
console.log(`Optimized average: ${(optTotal / runs).toFixed(2)} ms`);
console.log(`Improvement: ${(((unoptTotal - optTotal) / unoptTotal) * 100).toFixed(2)}%`);
