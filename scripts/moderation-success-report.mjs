const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOOKBACK_HOURS = Number(process.env.MODERATION_REPORT_HOURS ?? '24');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`
};

const posts = await fetchJson(
  `${SUPABASE_URL}/rest/v1/posts?select=id,status,moderation_path,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc`,
  headers
);

const runs = await fetchJson(
  `${SUPABASE_URL}/rest/v1/moderation_runs?select=provider,decision,error_code,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc`,
  headers
);

const postSummary = summarizePosts(posts);
const providerSummary = summarizeRuns(runs);

console.log(
  JSON.stringify(
    {
      lookbackHours: LOOKBACK_HOURS,
      since,
      posts: postSummary,
      providers: providerSummary
    },
    null,
    2
  )
);

async function fetchJson(url, reqHeaders) {
  const response = await fetch(url, { headers: reqHeaders });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  return response.json();
}

function summarizePosts(posts) {
  const total = posts.length;
  const approved = posts.filter((post) => post.status === 'APPROVED').length;
  const manualReview = posts.filter((post) => post.status === 'MANUAL_REVIEW').length;
  const rejected = posts.filter((post) => post.status === 'REJECTED').length;
  const crisis = posts.filter((post) => post.status === 'CRISIS').length;

  return {
    total,
    approved,
    manualReview,
    rejected,
    crisis,
    approvedRate: total ? approved / total : 0,
    automatedDecisionRate: total ? (approved + rejected + crisis) / total : 0
  };
}

function summarizeRuns(runs) {
  const byProvider = new Map();

  for (const run of runs) {
    const current = byProvider.get(run.provider) ?? { total: 0, success: 0, error: 0, latestErrorCode: null };
    current.total += 1;
    if (run.decision === 'ERROR') {
      current.error += 1;
      current.latestErrorCode = run.error_code ?? current.latestErrorCode;
    } else {
      current.success += 1;
    }
    byProvider.set(run.provider, current);
  }

  return Object.fromEntries(
    Array.from(byProvider.entries()).map(([provider, stats]) => [
      provider,
      {
        ...stats,
        successRate: stats.total ? stats.success / stats.total : 0,
        errorRate: stats.total ? stats.error / stats.total : 0
      }
    ])
  );
}
