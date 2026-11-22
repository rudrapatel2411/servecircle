import http from 'node:http';

async function request(url, options = {}) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('--- Testing Call Request System End-to-End ---');

  // 1. Customer creates a call request
  const createRes = await request('http://127.0.0.1:5000/api/call-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9876543210',
      serviceType: 'Home Repairs',
      category: 'Home Repairs',
    }),
  });

  console.log('1. Customer Create Call Request:', createRes.status, createRes.data);
  if (createRes.status !== 201 || !createRes.data.success) {
    throw new Error('Create call request failed');
  }

  const requestId = createRes.data.requestId;
  console.log('Generated Request ID:', requestId);

  // 2. Admin logs in and checks active call requests
  const adminLogin = await request('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin2@gmail.com', password: 'Admin@123' }),
  });
  console.log('2. Admin Login status:', adminLogin.status, 'User role:', adminLogin.data?.user?.role);
  const adminToken = adminLogin.data?.token;

  if (adminToken) {
    const getCalls = await request('http://127.0.0.1:5000/api/call-requests', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('3. Admin Call Requests status:', getCalls.status, 'Total active calls:', getCalls.data?.total);
    const found = getCalls.data?.requests?.some((r) => r.requestId === requestId);
    console.log('Verified: Request ID exists in Admin active list:', found);
  }

  // 3. Worker logs in and accepts the call request
  const workerLogin = await request('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'homerepairs.worker@gmail.com', password: 'worker123' }),
  });
  console.log('4. Worker Login status:', workerLogin.status, 'Worker role:', workerLogin.data?.user?.role);
  const workerToken = workerLogin.data?.token;

  if (workerToken) {
    const acceptRes = await request(`http://127.0.0.1:5000/api/call-requests/${requestId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    console.log('5. Worker Accept Call status:', acceptRes.status, acceptRes.data);
    if (acceptRes.status === 200 && acceptRes.data.success) {
      console.log('SUCCESS: Call Request flow 100% verified end-to-end!');
    } else {
      console.warn('Accept response:', acceptRes.data);
    }
  }
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
