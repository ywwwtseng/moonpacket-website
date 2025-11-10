Data folder

This folder contains SEO-visible JSON placeholders served at build time.

- Replace `placeholders.json` with your live API later by updating `data-api-src` on metric elements.
- Ensure CORS is allowed for your domain, since the client island fetches directly from the endpoint.
- Recommended shape:
```
{
  "as_of": "2025-10-01T00:00:00Z",
  "prices": { "BTC_USDT": 68000.12 },
  "red_packets": { "total_sent": 1234567, "total_claimed": 987654, "total_amount_usdt": 54321.98 }
}
```


