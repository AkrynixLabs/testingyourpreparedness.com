import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

// withSentryConfig's source-map-upload step needs SENTRY_ORG/SENTRY_PROJECT/
// SENTRY_AUTH_TOKEN (none of which exist in this environment, same
// deliberate "no real keys yet" choice as every other integration here) -
// it degrades gracefully without them (skips the upload with a console
// warning, doesn't fail the build - verified directly by running a real
// build with none of these set, see docs/build-log.md). `silent: true` keeps
// that expected warning out of normal build output.
// Turbopack is this project's active bundler (confirmed via a real `next
// build` run) - the Sentry Next.js SDK (10.69.0) has dedicated Turbopack
// support (its own after-production-compile hook), verified live rather
// than assumed. `disableLogger` was tried and dropped: Sentry's own build
// output warns it's deprecated and "not supported with Turbopack" - kept
// out rather than left in as a stale no-op option.
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "akrynix-labs",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
