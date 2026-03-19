const baseUrl = process.env.SMOKE_TEST_BASE_URL;

if (!baseUrl) {
  console.error('SMOKE_TEST_BASE_URL is required');
  process.exit(1);
}

async function assertOk(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response;
}

async function main() {
  await assertOk('/');
  await assertOk('/api/v1/admin/queue');
  await assertOk('/api/v1/posts', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      content: 'This is a production smoke test submission payload.',
      emotionTags: ['hope'],
      deviceFingerprintHash: 'smoke-test-device'
    })
  });

  console.log('Smoke test passed');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
