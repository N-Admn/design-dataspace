# Organisation logos

Local copies of the logos of the real organisations used in the prototype's sample data, one file per website domain (`who.int.webp`, `unicef.org.webp`, …), 256px WebP.
`manifest.json` lists each file with the organisation's name and the `etag` Logo.dev returned for it.

## Where they came from

Downloaded through the Logo.dev API (`GET /v2/brands/logo`, authorised with a secret key, then the returned file fetched), which is the route Logo.dev's
docs give for storing logo files; they were not saved from the image CDN. Do not re-download from `img.logo.dev` to refresh them. To refresh one, call the
API again and keep the new `etag`.

## Things to know

- The logos are the organisations' own marks and remain their trademarks. They are here to illustrate sample data, and should not be taken to mean that any
  organisation endorses or takes part in the prototype.
- The app uses this folder first (see `src/lib/org-logo.ts`): an organisation whose website matches a file here gets that logo with no outside request. Only an organisation without a file here falls back to Logo.dev, and only when `VITE_LOGO_DEV_TOKEN` is set.
- To add one, save the file as `<website domain>.webp` here; it is picked up automatically.
- `wateraid.org` is not here: the file Logo.dev returned for it was blank.
