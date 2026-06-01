const scholarships = Array.from({ length: 10000 }, (_, i) => ({
  deadline: new Date(Date.now() + (i % 60) * 24 * 3600 * 1000).toISOString()
}));

console.time('Baseline');
for (let j = 0; j < 100; j++) {
  const upcomingScholarships = scholarships.filter((s) => {
    const diffDays = (new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 30;
  });
}
console.timeEnd('Baseline');

console.time('Optimized');
for (let j = 0; j < 100; j++) {
  const nowTime = Date.now();
  const upcomingScholarships = scholarships.filter((s) => {
    const diffDays = (new Date(s.deadline).getTime() - nowTime) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 30;
  });
}
console.timeEnd('Optimized');
