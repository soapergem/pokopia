# Pokopia infrastructure

Static hosting for the `web/` app: a private S3 bucket behind a CloudFront
distribution, served over HTTPS at `pokopia.gemovationlabs.com`.

## What this creates

| Module / resource | Notes |
| --- | --- |
| `cloudposse/cloudfront-s3-cdn/aws` 2.1.1 | Creates the private origin bucket and the distribution. Versioned, SSE, public access blocked; CloudFront reaches the bucket through Origin Access Control. |
| `cloudposse/acm-request-certificate/aws` 0.18.1 | Requests the certificate in `us-east-1` (CloudFront accepts certificates from nowhere else). |
| `cloudflare_dns_record` | The `pokopia` CNAME to CloudFront, plus the certificate validation record. |
| `aws_acm_certificate_validation` | Waits for issuance against the Cloudflare validation record. |

Resource names come from `cloudposse/label`, so the origin bucket lands at
`<namespace>-<stage>-<name>-origin` — `gemlabs-prod-pokopia-origin` by default.

`gemovationlabs.com` is on Cloudflare, not Route 53, so DNS is managed with the
Cloudflare provider rather than `aws_route53_record`.

## Prerequisites

- Terraform >= 1.9
- AWS credentials with permission to manage S3, CloudFront, and ACM
- A Cloudflare API token with **Zone → DNS → Edit** on `gemovationlabs.com`

```bash
export CLOUDFLARE_API_TOKEN=...   # the provider reads this; it never enters state or tfvars
```

## Usage

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

The apply pauses on `aws_acm_certificate_validation` while ACM checks the
validation record. That normally clears in a couple of minutes. The distribution
itself takes longer to reach every edge, but `wait_for_deployment = false` means
Terraform returns without blocking on it.

## Deploying the site

```bash
cd web && npm run build && cd ..

BUCKET=$(terraform -chdir=terraform output -raw bucket_name)
DIST=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)

# Fingerprinted assets: safe to cache forever.
aws s3 sync web/dist "s3://$BUCKET" --delete \
  --exclude "*" --include "assets/*" \
  --cache-control "public, max-age=31536000, immutable"

# Everything else keeps its filename across deploys, so cache it briefly.
aws s3 sync web/dist "s3://$BUCKET" --delete \
  --exclude "assets/*" \
  --cache-control "public, max-age=300"

aws cloudfront create-invalidation --distribution-id "$DIST" \
  --paths "/index.html" "/*.json"
```

Run the two syncs in that order; the second one carries `--delete`, so it prunes
files removed from the build.

## Notes

- **Cache split.** Vite fingerprints everything under `/assets`, so the default
  behaviour uses the managed `CachingOptimized` policy. `index.html` and the
  Pokédex JSON keep stable names, so they get a separate 5-minute policy and a
  deploy-time invalidation.
- **Two module defaults are overridden deliberately.** `origin_access_type` is
  set to `origin_access_control`, because the module still defaults to the legacy
  origin access identity; and `cloudfront_access_logging_enabled` is set to
  `false`, because the module otherwise provisions a whole log bucket (plus an
  IAM user submodule) that this site does not need. Flip
  `cloudfront_access_logging_enabled = true` to turn logging back on.
- **Certificate validation is wired by hand.** The ACM module can create its own
  Route 53 validation records, but this zone is on Cloudflare, so
  `process_domain_validation_options = false` and both the validation record and
  the `aws_acm_certificate_validation` that waits on it live in `acm.tf`.
- **No SPA fallback.** The app has no client-side router, so unknown paths are
  left as genuine 404s. If a router is added later, add a `custom_error_response`
  mapping 403/404 to `/index.html` with a 200.
- **Cloudflare proxying is off.** CloudFront terminates TLS with the ACM
  certificate; proxying through Cloudflare would stack a second CDN in front of
  it. Override with `cloudflare_proxied = true` if that is ever wanted.
- **State is local.** `terraform.tfstate` stays on disk and is gitignored. Move it
  to an S3 backend with DynamoDB locking if more than one person will apply.
