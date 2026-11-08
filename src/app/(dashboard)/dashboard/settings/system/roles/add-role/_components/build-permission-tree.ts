import { CATEGORY_LABELS, modelLabel } from "./permission-labels";
import type {
  PermissionAction,
  PermissionGroup,
  PermissionItem,
} from "./types";

/**
 * Given the flat list of permissions from the API (each with `id` and `permission`),
 * build a hierarchical tree grouped by category → model → action.
 *
 * Example API item: { id: "b72dc48e...", permission: "academicClass.create" }
 * Gets mapped to: category="academics" → model="academicClass" → action="create"
 */
export function buildPermissionTree(
  apiPermissions: PermissionItem[],
): PermissionGroup[] {
  // Group by category (first segment before the first dot)
  const categoryMap = new Map<string, Map<string, PermissionAction[]>>();

  for (const item of apiPermissions) {
    if (!item.permission) continue; // skip items without a permission string
    const parts = item.permission.split(".");
    if (parts.length !== 2) continue; // skip malformed

    const [modelKey, actionKey] = parts as [string, string];
    const categoryKey = resolveCategoryKey(modelKey);

    let modelMap = categoryMap.get(categoryKey);
    if (!modelMap) {
      modelMap = new Map();
      categoryMap.set(categoryKey, modelMap);
    }

    let actions = modelMap.get(modelKey);
    if (!actions) {
      actions = [];
      modelMap.set(modelKey, actions);
    }

    actions.push({
      key: `${modelKey}.${actionKey}`,
      value: item.permission,
      id: item.id,
    });
  }

  // Convert to tree structure, sorted alphabetically
  const groups: PermissionGroup[] = [];
  const sortedCategoryKeys = [...categoryMap.keys()].sort();

  for (const categoryKey of sortedCategoryKeys) {
    const modelMap = categoryMap.get(categoryKey);
    if (!modelMap) continue;

    const sortedModelKeys = [...modelMap.keys()].sort();
    const sortedActions: Record<string, number> = {
      view: 0,
      create: 1,
      edit: 2,
      delete: 3,
      manage: 4,
    };

    const subGroups: PermissionGroup["subGroups"] = [];
    for (const modelKey of sortedModelKeys) {
      const actions = modelMap.get(modelKey);
      if (!actions) continue;

      actions.sort((a, b) => {
        const aKey = a.key.split(".").pop() ?? "";
        const bKey = b.key.split(".").pop() ?? "";
        return (sortedActions[aKey] ?? 99) - (sortedActions[bKey] ?? 99);
      });
      subGroups.push({
        label: modelLabel(modelKey),
        key: modelKey,
        permissions: actions,
      });
    }

    groups.push({
      label: CATEGORY_LABELS[categoryKey] ?? modelLabel(categoryKey),
      key: categoryKey,
      subGroups,
    });
  }

  return groups;
}

/**
 * Map a model key to its category key using the known permission structure.
 */
function resolveCategoryKey(modelKey: string): string {
  // Administration
  if (
    [
      "administrator",
      "role",
      "userRole",
      "permission",
      "rolePermission",
    ].includes(modelKey)
  )
    return "administration";
  // Settings
  if (["institutionConfig", "holiday"].includes(modelKey)) return "settings";
  // Academics
  if (
    [
      "feeType",
      "feeItem",
      "shift",
      "designation",
      "designationBasedSalary",
      "customSalary",
      "overtimeTeacherConfig",
      "overtimeStaffConfig",
      "academicSession",
      "program",
      "department",
      "academicClass",
      "academicSection",
      "subject",
      "academicClassSubject",
      "batch",
      "examConfig",
      "examSchedule",
      "gradeSystem",
      "classRoutine",
      "classRoutineItem",
    ].includes(modelKey)
  )
    return "academics";
  // Students
  if (
    [
      "student",
      "studentEnrollment",
      "studentFee",
      "studentFeeCollection",
      "studentFeeCollectionItem",
      "idCardGenerateLog",
      "admitCardLog",
      "studentExamResult",
      "studentAttendance",
      "studentLibraryMember",
    ].includes(modelKey)
  )
    return "students";
  // Teachers
  if (
    [
      "teacher",
      "teacherAttendance",
      "teacherLeaveRequest",
      "teacherOvertime",
      "teacherResignation",
      "teacherPayroll",
      "salaryAdvance",
    ].includes(modelKey)
  )
    return "teachers";
  // Staff
  if (
    [
      "staff",
      "staffAttendance",
      "staffLeave",
      "staffOvertime",
      "staffResignation",
      "staffPayroll",
    ].includes(modelKey)
  )
    return "staff";
  // Finance
  if (
    [
      "payrollCycle",
      "payrollPayment",
      "expenseType",
      "expense",
      "expenseItem",
      "depositType",
      "deposit",
      "depositItem",
    ].includes(modelKey)
  )
    return "finance";
  // Hostel
  if (
    [
      "hostelConfiguration",
      "hostelFloor",
      "hostelRoom",
      "hostelAllocation",
      "hostelFeeCollection",
      "hostelFeeCollectionItem",
      "mealCollection",
      "hostelExpense",
      "hostelExpenseItem",
    ].includes(modelKey)
  )
    return "hostel";
  // Quarter
  if (
    [
      "quarterConfiguration",
      "quarterFloor",
      "quarterFlat",
      "quarterAllocation",
      "quarterRentCollection",
      "quarterExpense",
      "quarterExpenseItem",
    ].includes(modelKey)
  )
    return "quarter";
  // Transport
  if (
    [
      "vehicleDriver",
      "vehicleConfiguration",
      "vehicleChecking",
      "vehicleExpense",
      "vehicleExpenseItem",
      "vehicleVendor",
      "vendorVehicleConfiguration",
      "vendorVehicleChecking",
      "vendorVehicleExpense",
      "vendorVehicleExpenseItem",
    ].includes(modelKey)
  )
    return "transport";
  // Library
  if (
    [
      "bookShelfConfiguration",
      "bookCategory",
      "book",
      "membershipFeeCollection",
      "borrowedBook",
      "libraryExpense",
      "libraryExpenseItem",
      "libraryDeposit",
    ].includes(modelKey)
  )
    return "library";
  // Complaints
  if (["complaint"].includes(modelKey)) return "complaints";
  // Feedback
  if (
    [
      "feedbackForm",
      "feedbackQuestion",
      "feedbackResponse",
      "feedbackAnswer",
    ].includes(modelKey)
  )
    return "feedback";

  return "other";
}
