"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deleteGradeSystem } from "@/services/grade-system";
import {
  GraduationCap,
  Edit,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { TGradeSystem } from "@/types/modules/grade-system/grade-system.type";
import GradeSystemDialog from "./GradeSystemDialog";

interface GradeSystemTableProps {
  gradeSystems: TGradeSystem[] | [];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
  onAddClick?: () => void;
}

const PAGE_SIZE = 10;

const GradeSystemTable = ({ gradeSystems, currentPage, totalItems, totalPages, onAddClick }: GradeSystemTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeSystemToDelete, setGradeSystemToDelete] = useState<TGradeSystem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gradeSystemToEdit, setGradeSystemToEdit] = useState<TGradeSystem | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleEditClick = (gradeSystem: TGradeSystem) => {
    setGradeSystemToEdit(gradeSystem);
    setEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const filteredGradeSystems = useMemo(() => {
    if (!searchQuery.trim()) return gradeSystems;
    const query = searchQuery.toLowerCase();
    return gradeSystems.filter(
      (gradeSystem) =>
        gradeSystem.grade_name.toLowerCase().includes(query) ||
        gradeSystem.remark?.toLowerCase().includes(query)
    );
  }, [gradeSystems, searchQuery]);

  const paginatedGradeSystems = filteredGradeSystems;
  const canGoNext = totalPages ? currentPage < totalPages : gradeSystems.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleDeleteClick = (gradeSystem: TGradeSystem) => {
    setGradeSystemToDelete(gradeSystem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!gradeSystemToDelete) return;

    startTransition(async () => {
      const response = await deleteGradeSystem(gradeSystemToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete grade system");
        return;
      }
      toast.success(response.message ?? "Grade system deleted successfully");
      setDeleteDialogOpen(false);
      setGradeSystemToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Grade Systems</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateClick}
              className="h-9 bg-primary hover:bg-primary/90"
            >
              + Create Grade System
            </Button>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by grade name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredGradeSystems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No grade systems match your search."
                  : "No grade systems found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Create a grade system to get started."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SL No.
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Grade
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Mark Range
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      GPA
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Remarks
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGradeSystems.map((gradeSystem, index) => (
                    <TableRow
                      key={gradeSystem.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {gradeSystem.grade_name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {gradeSystem.mark_from} - {gradeSystem.mark_to}
                      </TableCell>
                      <TableCell className="text-xs">
                        {gradeSystem.grade_point.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {gradeSystem.remark || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit grade system"
                            onClick={() => handleEditClick(gradeSystem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(gradeSystem)}
                            title="Delete grade system"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? `Showing ${filteredGradeSystems.length} matching item${filteredGradeSystems.length === 1 ? "" : "s"}`
                    : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground">
                    Page {currentPage}
                    {totalPages ? ` of ${totalPages}` : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!canGoNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Grade System"
        description={
          gradeSystemToDelete
            ? `Are you sure you want to delete "${gradeSystemToDelete.grade_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this grade system? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <GradeSystemDialog
        gradeSystem={gradeSystemToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <GradeSystemDialog
        gradeSystem={null}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};

export default GradeSystemTable;