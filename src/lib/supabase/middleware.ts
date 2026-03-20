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
                setAll(cookiesToSet) {
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

    // Get session from cookie - don't call getUser() on every request
    // Let Server Components handle session validation
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protect /account routes
    if (request.nextUrl.pathname.startsWith('/account') && !session) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Protect /admin routes - check for admin or staff role
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!session?.user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }

        // Only check role for /admin routes (not /admin/staff)
        // Staff can access /admin/staff, admins can access all /admin/*
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        const isAdmin = profile?.role === 'admin';
        const isStaff = profile?.role === 'staff';
        const isStaffPath = request.nextUrl.pathname.startsWith('/admin/staff');

        // Block non-admin users from admin dashboard, allow staff only on staff paths
        if (!isAdmin && !isStaff) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        // Redirect staff away from main admin dashboard
        if (isStaff && !isAdmin && !isStaffPath) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/staff';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
