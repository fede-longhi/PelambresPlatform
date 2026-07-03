import { auth } from '@/auth';
import { fetchAlternateAccountsForUser } from '@/lib/data/user-data';
import RoleSwitchButton from '@/components/shared/role-switch-button';

export default async function RoleSwitchNavItem() {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  const alternateAccounts = await fetchAlternateAccountsForUser(
    sessionUser.email,
    sessionUser.id
  );
  const alternateAccount = alternateAccounts[0];

  if (!alternateAccount) {
    return null;
  }

  return (
    <RoleSwitchButton
      targetUserId={alternateAccount.id}
      targetRole={alternateAccount.role}
    />
  );
}
