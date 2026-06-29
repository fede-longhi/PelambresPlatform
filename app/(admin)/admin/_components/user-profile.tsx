import { auth } from '@/auth';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UserProfile() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <Link
      href="/admin/profile"
      className="m-2 flex flex-row items-center justify-center space-x-2 text-clip rounded-md bg-gray-50 p-3 text-xs hover:bg-sky-100"
    >
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name ?? 'user image'}
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="overflow-hidden text-ellipsis">{session.user.email}</span>
    </Link>
  );
}
