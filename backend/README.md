Supabase backend scaffold for Irongate

Overview
- This folder contains SQL schema, an OpenAPI spec, and sample Supabase Edge Function templates to implement the auth and check-in APIs.

Quick start (Supabase)
1. Create a Supabase project at https://app.supabase.com (free tier available).
2. Install Supabase CLI locally: `npm install -g supabase`.
3. From this folder, push the SQL schema to your database:

```bash
supabase db reset --file schema.sql
# or run the SQL in Supabase SQL editor
```

4. Create Edge Functions (or deploy server code) and set environment vars:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `SUPABASE_ANON_KEY` (for client usage)

5. Deploy functions with the Supabase CLI. See function templates under `functions/`.

Files
- `schema.sql` — DB schema and gym seeds
- `openapi.yaml` — API surface design
- `functions/` — sample TypeScript Edge Function templates

Notes
- This scaffold uses Supabase Auth for user authentication. Store user profile data in a `profiles` table linked to `auth.users`.
- For production, use the Supabase service role key only on server-side functions. Never expose it to clients.
