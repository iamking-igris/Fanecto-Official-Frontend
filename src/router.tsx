import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";
import { NotFoundPage } from "@/components/fanecto/not-found";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFoundPage,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}
