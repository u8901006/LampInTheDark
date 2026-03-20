# Custom Domain Setup

## Goal

Point a production custom domain at the existing Vercel deployment for `lampinthedark-prod`.

## Recommended Sequence

1. Choose the production hostname, for example `app.example.com`.
2. Add the domain to the Vercel project:

```bash
vercel domains add app.example.com
```

3. Follow the Vercel dashboard instructions to create the required DNS records with your DNS provider.
4. Wait for DNS propagation and confirm Vercel reports the domain as configured.
5. Verify that the custom domain resolves to the same deployment currently available at `lampinthedark-prod.vercel.app`.
6. Re-run smoke tests against the custom domain before announcing it publicly.

## DNS Notes

- Use the DNS records Vercel provides for your exact hostname.
- If you use an apex domain, Vercel may require `A` records or provider-specific flattening.
- If you use a subdomain, Vercel commonly requires a `CNAME` record.

## Verification

- Homepage loads successfully over HTTPS
- `GET /api/v1/admin/queue` returns `200`
- `POST /api/v1/posts` returns `201`
- TLS certificate is issued and valid

## Rollback

- Keep the Vercel default domain available during cutover
- If DNS configuration breaks traffic, revert the DNS record to the prior target and continue using `lampinthedark-prod.vercel.app`
