This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Running tests (new)

This project now includes unit tests for the auto-layout logic using Jest + ts-jest.

Install new dev dependencies (you can add these to your devDependencies):

```bash
npm install --save-dev jest ts-jest @types/jest jsdom @types/jsdom
```

Run tests:

```bash
npm run test
```

If you prefer watch mode:

```bash
npm run test:watch
```

## Release Process (Conventional Commits)

This repository uses [semantic-release](https://semantic-release.gitbook.io/) to automate releases based on [Conventional Commits](https://www.conventionalcommits.org/). The workflow is defined in `.github/workflows/release.yml` and automatically creates releases when commits are merged to `main`.

### How It Works

- Commits following the conventional format (`feat:`, `fix:`, etc.) are analyzed
- Version numbers are automatically bumped based on commit types
- A changelog is automatically generated and committed
- A GitHub release is created with release notes
- No manual version management needed!

### Contributing

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines and examples.

### Manual Trigger

To trigger the release workflow manually, go to the Actions tab and run the "Conventional Release" workflow.

### Version Display

The UI displays the current package version in the navigation bar (derived from `package.json` or the `NEXT_PUBLIC_APP_VERSION` env var set at build time). If you need to override the visible version (for example in CI), set the `NEXT_PUBLIC_APP_VERSION` environment variable at build time before running `next build`.
