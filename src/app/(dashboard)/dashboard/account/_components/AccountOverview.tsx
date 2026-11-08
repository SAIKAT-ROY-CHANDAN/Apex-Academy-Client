"use client";

import { useState } from "react";
import type { TAdminUser } from "@/types/modules/admin-user/admin-user.type";
import AccountEditForm from "./AccountEditForm";
import AccountProfileView from "./AccountProfileView";

type AccountOverviewProps = {
  admin: TAdminUser;
  userType?: string;
};

export function AccountOverview({ admin, userType }: AccountOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <AccountEditForm
        admin={admin}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <AccountProfileView
      admin={admin}
      userType={userType}
      onEdit={() => setIsEditing(true)}
    />
  );
}
