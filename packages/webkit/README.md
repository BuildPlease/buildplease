# @buildplease/webkit

WebKit provides the shared browser-side runtime for BuildPlease applications, including dependency injection, HTTP networking, request interceptors, web models, and L10n integration.

## Install

```bash
pnpm add @buildplease/webkit
```

## Usage

```ts
import { HttpError, InterceptorSet, webkitAssembly } from '@buildplease/webkit';

const assemblies = webkitAssembly();
```

WebKit re-exports the Core API, so shared BuildPlease primitives can be imported from the same package in browser applications.

## What’s included

- browser application assembly
- Axios-based remote networking primitives
- request interceptors and cookie handling
- HTTP error handling
- shared web models
- L10n integration

Part of [BuildPlease](https://github.com/BuildPlease/buildplease).
