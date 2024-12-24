import { onRequest as __api___route___js_onRequest } from "/workspaces/codespaces-blank/sonnet_api/functions/api/[[route]].js"
import { onRequest as ___middleware_js_onRequest } from "/workspaces/codespaces-blank/sonnet_api/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___route___js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]