# Organisation logos

Where the app gets organisation logos. Nothing is requested from an outside service.

An organisation's logo is, in order:

1. the one it uploaded;
2. a local copy of its real logo in this folder, matched by its website domain (`who.int.webp` is the logo for who.int);
3. a mock logo from `mock/` (`mock-01.png` to `mock-25.png`), picked from the organisation's name, so the same organisation always gets the same one.

The picking is in `src/lib/org-logo.ts`. To give an organisation a particular logo, save it here as `<website domain>.webp`; to change the set of mock logos, add
or replace files in `mock/` (the originals are kept in `visuals/org-logo`).

## The local copies of real logos

24 organisations used in the sample data (WHO, UNICEF, UNEP and others), 256px WebP, listed in `manifest.json` with the organisation's name. They were
downloaded once through the Logo.dev API (with a secret key, the route its docs give for storing files); the app does not use Logo.dev.

## Things to know

- The logos are the organisations' own marks and remain their trademarks; they illustrate sample data and do not imply that any organisation endorses or takes
  part in the prototype.
- The mock logos are placeholders for organisations that have no real logo here: they are not those organisations' logos.
