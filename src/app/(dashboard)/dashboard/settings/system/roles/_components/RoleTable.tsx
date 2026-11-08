"use client";

import { CalendarDays, KeyRound, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TRole } from "@/types/modules/role/role.type";

interface RoleTableProps {
  roles: TRole[];
}

const MAX_VISIBLE_PERMISSIONS = 3;

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const RoleTable = ({ roles }: RoleTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const query = searchTerm.trim().toLowerCase();
  const filteredRoles = useMemo(() => {
    if (!query) return roles;
    return roles.filter((role) => {
      const name = role.role_name.toLowerCase();
      const permissions = (role.permissions ?? []).join(" ").toLowerCase();
      return name.includes(query) || permissions.includes(query);
    });
  }, [roles, query]);

  const totalPermissions = useMemo(
    () => roles.reduce((sum, role) => sum + (role.permission_count ?? 0), 0),
    [roles],
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Roles
              </p>
              <p className="mt-1 text-2xl font-bold leading-none">
                {roles.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <KeyRound className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Permissions
              </p>
              <p className="mt-1 text-2xl font-bold leading-none">
                {totalPermissions}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            All Roles
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-medium">
            {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles or permissions…"
              className="h-9 pl-8 text-sm"
            />
          </div>

          {filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShieldCheck className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {roles.length === 0
                  ? "No roles found."
                  : "No roles match your search."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {roles.length === 0
                  ? "Create your first role using the Add Role button above."
                  : "Try a different role name or permission."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SN
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role Name
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Permissions
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Count
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role, index) => {
                    const permissions = role.permissions ?? [];
                    const visible = permissions.slice(
                      0,
                      MAX_VISIBLE_PERMISSIONS,
                    );
                    const hidden = permissions.length - visible.length;
                    return (
                      <TableRow
                        key={role.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm font-semibold">
                          {role.role_name}
                        </TableCell>
                        <TableCell>
                          {permissions.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                              No permissions
                            </span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {visible.map((permission) => (
                                <Badge
                                  key={permission}
                                  variant="outline"
                                  className="bg-slate-50 text-xs font-medium text-slate-600"
                                >
                                  {permission}
                                </Badge>
                              ))}
                              {hidden > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium"
                                >
                                  +{hidden} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-primary/10 px-2 py-0 text-xs font-medium text-primary hover:bg-primary/10">
                            {role.permission_count ?? permissions.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
                            {formatDate(role.created_at)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RoleTable;
