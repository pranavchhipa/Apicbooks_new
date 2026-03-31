import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
                setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

    // Refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected Routes Pattern
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/my-books') ||
        request.nextUrl.pathname.startsWith('/clubs') ||
        request.nextUrl.pathname.startsWith('/folios') ||
        request.nextUrl.pathname.startsWith('/discover') ||
        request.nextUrl.pathname.startsWith('/wishlist');

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

    // Auth bypass for dev testing: remove this block when done
    const bypassAuth = request.nextUrl.searchParams.get('bypass') === 'true' ||
        request.cookies.get('bypass-auth')?.value === 'true';

    if (isProtectedRoute && !user && !bypassAuth) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Set bypass cookie if ?bypass=true is in URL
    if (bypassAuth && !request.cookies.get('bypass-auth')?.value) {
        supabaseResponse.cookies.set('bypass-auth', 'true', { path: '/', maxAge: 60 * 60 * 24 });
    }

    if (isAuthRoute && user) {
        // If user is already logged in, redirect away from auth pages
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse;
}

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
