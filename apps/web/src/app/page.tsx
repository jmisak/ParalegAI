import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');

  if (authToken) {
    redirect('/dashboard/matters');
  }

  redirect('/login');
}
