# Growora

Growora is a mobile-first pixel-art farming adventure.

## Project status
This repository is the clean foundation for the game. The current page is a UI scaffold only; it does not yet connect to a database or process real payments.

## Planned systems
- Farming and 9 crop fields
- Fishing
- Beehive and honey production
- Chicken coop and egg production
- Player wallet and secure USDT deposit/withdrawal workflow
- Admin dashboard

## Security
- Never put Supabase service-role keys, private keys, or other secrets in browser code.
- Deposits and withdrawals must be verified server-side.
- Game balances and item timers must be validated by trusted server-side logic.

## Run locally
Open `apps/web/index.html` in a browser.
