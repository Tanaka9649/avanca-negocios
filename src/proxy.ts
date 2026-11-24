import { NextResponse, type NextRequest } from "next/server";

// Checagem rápida: sem cookie de sessão, o painel redireciona para o login.
// A validação real (sessão no banco e permissões) acontece no servidor de cada página e ação.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/admin/primeiro-acesso") return NextResponse.next();
  if (!request.cookies.get("an_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
