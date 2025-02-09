// import { getToken } from 'next-auth/jwt';
// import { NextResponse } from 'next/server';

// export async function middleware(req) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//   // Redirect to login if no token is found
//   if (!token) {
//     return NextResponse.redirect(new URL('/auth/login', req.url));
//   }

//   return NextResponse.next();
// }

// // Apply to protected paths
// export const config = {
//   matcher: ['/protected/:path*'],
// };