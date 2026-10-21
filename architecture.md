# Architecture plan

## Frontend
`apps/web/` contains the browser interface and animated game world. It must never contain service-role credentials or private wallet keys.

## Backend
Supabase is planned for authentication, database, and server-side functions. A new project should be selected or created deliberately before migrations are applied.

## Trusted game logic
Server-side functions should validate purchases, planting, growth completion, harvesting, sales, fishing rolls, production cycles, wallet ledger entries, deposits, and withdrawals.

## Financial safety requirements
- Verify deposits through a trusted chain/provider source, not screenshots.
- Enforce unique transaction IDs and idempotency.
- Keep a ledger for wallet movements.
- Reserve withdrawal funds until payout confirmation.
- Store payout TXIDs and audit administrator actions.
- Never permit routine manual balance edits.
