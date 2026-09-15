import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const registerDuration = new Trend('register_duration');
const listDuration = new Trend('list_duration');

// Varying workload: ramp up, steady, spike, ramp down
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp-up: low load
    { duration: '1m',  target: 10 },   // steady low load
    { duration: '30s', target: 50 },   // ramp-up: medium load
    { duration: '1m',  target: 50 },   // steady medium load
    { duration: '20s', target: 150 },  // spike
    { duration: '40s', target: 150 },  // sustained spike
    { duration: '30s', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],   // 95% of requests under 800ms
    http_req_failed: ['rate<0.05'],     // less than 5% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Mix of write (register) and read (list) traffic, ~1:3 ratio
  const email = `user_${__VU}_${__ITER}_${Date.now()}@test.com`;

  const payload = JSON.stringify({
    fullName: `Load Test User ${__VU}-${__ITER}`,
    email,
    phone: '9999999999',
    course: 'B.E. CSE',
    year: '2nd Year',
    dob: '2004-05-10',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };

  // 25% of iterations register a new student
  if (__ITER % 4 === 0) {
    const res = http.post(`${BASE_URL}/api/students`, payload, params);
    registerDuration.add(res.timings.duration);
    check(res, {
      'register status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    });
  } else {
    const res = http.get(`${BASE_URL}/api/students`);
    listDuration.add(res.timings.duration);
    check(res, {
      'list status is 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
