import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // On regarde si le cookie de session Supabase est présent
  const hasSession = request.cookies.has('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0] + '-auth-token')

  // Si pas de session et qu'on essaie d'accéder à une page protégée
  if (!hasSession && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si on a une session et qu'on va sur /login, on redirige vers le chat
  if (hasSession && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// On applique ce middleware à toutes les pages sauf les fichiers statiques et l'API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
