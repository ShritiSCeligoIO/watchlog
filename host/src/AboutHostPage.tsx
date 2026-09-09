export default function AboutHostPage() {
  return (
    <article className="shell__page">
      <h1>About this host</h1>
      <p>
        This shell is a separate npm project with its own dependencies, build,
        React root, router, and development server.
      </p>
      <p>
        A clean Network recording shows that <code>remoteEntry.js</code> loads
        on this route so Webpack can initialize sharing. The remote application
        chunks stay deferred until you open Watchlist or Sign in.
      </p>
    </article>
  );
}
