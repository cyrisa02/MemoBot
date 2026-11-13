import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. On initialise la réponse par défaut
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. On crée le client Supabase pour le serveur (Middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. TRÈS IMPORTANT : On vérifie l'utilisateur.
  // Cela force le rafraîchissement du token si nécessaire.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Logique de redirection
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // Si pas connecté et qu'on n'est pas sur /login -> on redirige vers /login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si connecté et qu'on est sur /login -> on redirige vers le chat
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 5. On retourne la réponse (avec les cookies mis à jour si besoin)
  return supabaseResponse
}

// On applique le middleware à toutes les routes sauf les fichiers statiques et les API
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
