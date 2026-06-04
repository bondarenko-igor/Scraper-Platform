# AI Extraction

The extraction layer turns a rendered page snapshot into JSON.

## Default behavior

If no custom schema is supplied, the extractor returns a generic document envelope with:

- page metadata
- summary
- cleaned text
- outgoing links
- source-specific hints

## Custom schema

If you supply `output_schema` in a job, the AI layer is instructed to return JSON matching that schema. The worker validates the response and retries once with a repair prompt if the payload is malformed.

## OLX support

For OLX pages, the platform first tries deterministic extraction from JSON-LD and then enriches the record with the AI layer. This keeps the old mini-scraper behavior while still supporting arbitrary pages.

