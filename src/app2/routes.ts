import { Data, Route } from "@angular/router";

import { AuthGuard, AuthPageComponent, ErrorComponent, LoadingComponent, queryNameResolver } from "@sinequa/atomic-angular";
import { AgentLayoutComponent } from "./pages/agent/agent.layout";
import { HomeComponent } from "./pages/home/home";
import { SearchLayoutComponent } from "./pages/search/search.layout";
import { SearchAllComponent } from "./pages/search/search-all";

// Extended types to add custom properties to routes
type ExtendedData = Data & {
  queryName?: string; // name of the query defined in the admin
  display?: string; // the label you want to display in the interface
  wsQueryTab?: string; // the name of the "tab" associated with the query you want to use
  icon?: string; // the icon you want to associate with the label in the interface
  [key: string | symbol]: unknown; // all the "custom" parameters you want
};
type ExtendedRoute = Route & {
  data?: ExtendedData;
  children?: ExtendedRoutes;
};
type ExtendedRoutes = ExtendedRoute[];

export const routes: ExtendedRoutes = [
  { path: "login", component: AuthPageComponent },
  { path: "logout", component: AuthPageComponent },
  { path: "auth/:mode", component: AuthPageComponent },
  { path: "home", component: HomeComponent, canActivate: [AuthGuard()], resolve: { queryName: queryNameResolver } },
  {
    path: "assistant",
    loadComponent: () => import("./pages/assistant/assistant.layout").then(m => m.AssistantLayoutComponent),
    canActivate: [AuthGuard()],
    resolve: { queryName: queryNameResolver },
    data: { reuse: true } // This route will be "frozen" when we navigate away from it, and "thawed" when we come back to it
  },
  {
    path: "chat",
    canActivate: [AuthGuard()],
    component: AgentLayoutComponent,
    children: [
      {
        path: "new",
        loadComponent: () => import("./pages/agent/new.page").then(m => m.ChatNewPage)
      },
      {
        path: ":id",
        loadComponent: () => import("./pages/agent/id.page").then(m => m.ChatIdPage)
      },
      { path: "**", redirectTo: "new", pathMatch: "full" }
    ]
  },
  {
    path: "widgets",
    loadComponent: () => import("./pages/widgets/widgets.layout").then(m => m.WidgetsLayout2Component),
    canActivate: [AuthGuard()],
    children: [
      {
        path: "recent-searches",
        loadComponent: () => import("../components/widgets/recent-searches/recent-searches.component").then(m => m.RecentSearchesComponent)
      },
      {
        path: "bookmarks",
        loadComponent: () => import("../components/widgets/bookmarks/bookmarks.component").then(m => m.BookmarksComponent)
      },
      {
        path: "saved-searches",
        loadComponent: () => import("../components/widgets/saved-searches/saved-searches.component").then(m => m.SavedSearchesComponent)
      },
      {
        path: "collections",
        loadComponent: () => import("../components/widgets/collections/collections.component").then(m => m.CollectionsComponent)
      }
    ]
  },
  {
    path: "search",
    component: SearchLayoutComponent,
    canActivate: [AuthGuard()],
    children: [
      {
        path: "**",
        component: SearchAllComponent,
        resolve: { queryName: queryNameResolver }
      }
    ]
  },
  { path: "loading", component: LoadingComponent },
  { path: "error", component: ErrorComponent },
  { path: "**", redirectTo: "home", pathMatch: "full" }
];
