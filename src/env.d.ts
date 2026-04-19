/// <reference types="@cloudflare/workers-types" />

interface LocalesBindings {
  locales: D1Database;
}

type PagesFunction<Props = unknown, Env = LocalesBindings, Params = string> = (
  context: {
    request: Request;
    env: Env;
    params: Params;
    waitUntil(promise: Promise<any>): void;
  } & Props
) => Response | Promise<Response>;

export {};