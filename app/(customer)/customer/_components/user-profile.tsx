import Link from 'next/link';

export default function CustomerUserProfile({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <Link
      href="/customer/profile"
      className="m-2 flex flex-row items-center justify-center space-x-2 text-clip rounded-md bg-gray-50 p-3 text-xs hover:bg-sky-100"
    >
      <span className="overflow-hidden text-ellipsis font-medium">{name}</span>
      <span className="hidden overflow-hidden text-ellipsis text-muted-foreground md:inline">
        {email}
      </span>
    </Link>
  );
}
