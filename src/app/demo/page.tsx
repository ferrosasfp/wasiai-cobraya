// WKH-COBRAYA-DAPP-SHELL W8 — /demo is now a redirect stub.
// The negociar flow lives inside the (app) route group at /negociar.
// Keeping this stub preserves any old bookmarks / external links.
import { redirect } from "next/navigation";

export default function DemoRedirect() {
  redirect("/negociar");
}
