import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  
  layout("routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    
    prefix("documents", [
      index("routes/documents/index.tsx"),
      route("upload", "routes/documents/upload.tsx"),
      route(":id", "routes/documents/$id.tsx"),
    ]),
    
    prefix("reports", [
      index("routes/reports/index.tsx"),
      route("generate", "routes/reports/generate.tsx"),
      route(":id", "routes/reports/$id.tsx"),
    ]),
    
    route("chat", "routes/chat/index.tsx"),
    route("risk-analysis", "routes/risk-analysis/index.tsx"),
    
    prefix("sop", [
      index("routes/sop/index.tsx"),
      route("generate", "routes/sop/generate.tsx"),
      route(":id", "routes/sop/$id.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
