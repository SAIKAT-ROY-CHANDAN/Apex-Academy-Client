import {
  getHostelConfigurationById,
  getHostelConfigurations,
} from "@/services/hostelConfiguration";
import ManageHostelClient from "./_components/ManageHostelClient";
import type { HostelBuilding, HostelStudentRecord } from "./_components/types";
import { getAllocatedHostelStudents } from "@/services/hostelAllocation";

const SERVER_FETCH_LIMIT = 1000;

export default async function ManageHostelPage() {
  const [allocatedStudentsResult, buildingsResult] = await Promise.allSettled([
    getAllocatedHostelStudents([
      { label: "page", value: 1 },
      { label: "limit", value: SERVER_FETCH_LIMIT },
    ]),
    getHostelConfigurations([
      { label: "page", value: 1 },
      { label: "limit", value: SERVER_FETCH_LIMIT },
    ]),
  ]);

  const students: HostelStudentRecord[] =
    allocatedStudentsResult.status === "fulfilled"
      ? (allocatedStudentsResult.value?.data ?? [])
      : [];

  const buildingList: HostelBuilding[] =
    buildingsResult.status === "fulfilled" ? (buildingsResult.value?.data ?? []) : [];

  // The list endpoint already returns floors/rooms, but fetch full detail per
  // building in case that ever changes.
  const buildings = await Promise.all(
    buildingList.map(async (building) => {
      try {
        const detail = await getHostelConfigurationById(building.id);
        return (detail?.data ?? building) as HostelBuilding;
      } catch {
        return building;
      }
    }),
  );

  return <ManageHostelClient students={students} buildings={buildings} />;
}