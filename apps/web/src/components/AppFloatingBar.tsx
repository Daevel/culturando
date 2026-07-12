import { prisma } from "@culturando/db";

import { auth } from "@/config/auth";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { DashboardFloatingBar } from "@/features/dashboard/components/DashboardFloatingBar";

export async function AppFloatingBar() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      avatarUrl: true,
      nickname: true,
    },
  });

  return (
    <DashboardFloatingBar
      logoutAction={logoutAction}
      user={{
        ...session.user,
        avatarUrl: profile?.avatarUrl ?? session.user.avatarUrl,
        nickname: profile?.nickname ?? session.user.nickname,
      }}
    />
  );
}
