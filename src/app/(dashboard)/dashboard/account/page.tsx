import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminUserById } from "@/services/admin-auth";
import { loggedInAdminUser } from "@/services/logged-user";
import { AccountOverview } from "./_components/AccountOverview";

const AccountPage = async () => {
  const user = await loggedInAdminUser();

  if (!user?.id) {
    redirect("/admin-login");
  }

  const adminResponse = await getAdminUserById(user.id);
  const admin = adminResponse?.data;

  if (!admin) {
    return (
      <div className="space-y-8">
        <PageHeader title="My Account" />
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
          {adminResponse?.message ?? "Unable to load your account information."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AccountOverview admin={admin} userType={user.userType} />
    </div>
  );
};

export default AccountPage;
