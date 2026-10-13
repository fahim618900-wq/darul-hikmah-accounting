import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ─────────────────────────────────────────
  // /register চেক — সাইনআপ বন্ধ থাকলে সাদা পেজ
  // ─────────────────────────────────────────
  if (path === "/register") {
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "signup_enabled")
      .single();

    if (setting?.value !== "true") {
      return new NextResponse(
        "<!DOCTYPE html><html><head><title>404</title></head><body style='margin:0;background:#ffffff'></body></html>",
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }
  }

  // ─────────────────────────────────────────
  // /student চেক — পোর্টাল বন্ধ থাকলে সাদা পেজ
  // ─────────────────────────────────────────
  if (path.startsWith("/student")) {
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "student_portal_enabled")
      .single();

    if (setting?.value !== "true") {
      return new NextResponse(
        "<!DOCTYPE html><html><head><title>404</title></head><body style='margin:0;background:#ffffff'></body></html>",
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }
  }

  // লগইন না থাকলে সুরক্ষিত পেজে যেতে দেব না
  if (
    !user &&
    !path.startsWith("/login") &&
    !path.startsWith("/register") &&
    !path.startsWith("/auth") &&
    !path.startsWith("/student")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // লগইন থাকলে login/register-এ যেতে দেব না
  if (user && (path === "/login" || path === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
