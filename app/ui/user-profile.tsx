import { auth } from '@/auth';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { AUTHORIZED_USERS } from '../lib/user-definitions';

export default async function UserProfile() {
    const session = await auth();
    if (!session?.user || !AUTHORIZED_USERS.includes(session?.user.email??"")) redirect("/login");
    return (
        <div className="flex flex-row items-center justify-center bg-gray-50 p-3 text-xs m-2 space-x-2 text-clip">
            {
                session?.user?.image &&
                <Image 
                src={session?.user?.image}
                alt={session?.user?.name ? session?.user?.name : "user image"}
                width={32}
                height={32}
                className='rounded-full'    
                />
            }
            <h1 className="overflow-hidden text-ellipsis">{session?.user?.email}</h1>
        </div>
    )
}