# Stage 8 bundle analysis

## How to reproduce

```bash
npm install
npm run install:host
npm run analyze
```

The command creates:

- `reports/remote.html`
- `reports/remote-stats.json`
- `reports/host.html`
- `reports/host-stats.json`

Reports are generated evidence and are intentionally gitignored.

The numbers below came from fresh Stage 8 production builds.

## Remote output

- `assets/vendors.e7b52fec.chunk.js`: 498,873 bytes
- main application chunk: 99,541 bytes
- main application CSS: 19,096 bytes
- `remoteEntry.js`: 8,498 bytes
- standalone entry: 8,166 bytes
- remaining lazy JavaScript chunks: 5,362 bytes total

The output also contains source maps, which are not included above.

## Host output

- `assets/vendors.76065c69.chunk.js`: 266,299 bytes
- host entry: 9,363 bytes
- lazy host bootstrap: 5,508 bytes
- host CSS: 2,285 bytes

The host is small because WatchLog stays in remote chunks.

## Shared singleton evidence

Both stats files contain consume records for:

- `react@=19.0.0 (strict) (singleton)`
- `react-dom@=19.0.0 (strict) (singleton)`
- `react-dom/client@=19.0.0 (strict) (singleton)`
- `react-router-dom@=6.28.0 (strict) (singleton)`

That is evidence that Webpack negotiates one runtime instance for each shared
request. The browser smoke test also exercised hooks and remote routes under
the host's router without invalid-hook or missing-router-context errors.

There is an important distinction: the independent host and remote builds each
contain fallback provider code. That code is physically present so the host can
show a fallback when the remote is down and the remote can run standalone.
Therefore the reports do not prove that fallback bytes are absent from both
artifacts; they prove that Module Federation selects one compatible singleton
instance at runtime.

Removing either fallback would make the literal bundle-byte claim stronger,
but would break one of those required independent failure modes.

## Network observation

A clean, cache-disabled load of `/about-host` requested:

- the host entry and bootstrap chunks
- the host vendor chunk
- `http://localhost:3001/remoteEntry.js`

It did not request the remote application, CSS, or remote vendor chunks.

After clicking Watchlist, the browser requested the remote vendor,
`WatchLogApp`, application, and CSS chunks.

This resolves the earlier documentation contradiction: `remoteEntry.js` does
load on `/about-host`; the exposed application remains lazy.

## Conclusion

The split matches the intended ownership boundary. The remote entry is small,
the host stays thin, and the large application payload waits for a remote-owned
route. Ordinary vendor splitting is retained for readability; no custom
singleton fallback cache group is used.
