import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { getHostelFeeCollections } from "@/services/hostelFeeCollection";
import {
  getHostelConfigurations,
  getHostelConfigurationById,
} from "@/services/hostelConfiguration";
import DepositedPageClient from "./_components/DepositedPageClient";
import {
  extractData,
  PAGE_SIZE,
  parseHostelFeeCollectionsResponse,
  transformRecordsToRows,
  type TableRow,
} from "./_components/deposited.utils";

export interface HostelTreeRoom {
  id: string;
  label: string;
}

export interface HostelTreeFloor {
  id: string;
  label: string;
  rooms: HostelTreeRoom[];
}

export interface HostelTreeBuilding {
  id: string;
  label: string;
  floors: HostelTreeFloor[];
}

function floorLabel(f: any): string {
  const n = f.hostel_floor_number ?? f.floor_number ?? f.floor_no;
  if (n != null && n !== "" && !isNaN(Number(n))) {
    return `Floor ${n}`;
  }
  return f.name || String(n ?? f.id);
}

function roomLabel(r: any): string {
  const n = r.hostel_room_number ?? r.room_number ?? r.room_no;
  if (n != null && n !== "") {
    return String(n);
  }
  return r.name || String(r.id);
}

export default async function DepositedPage() {
  let hostelTree: HostelTreeBuilding[] = [];
  let initialRows: TableRow[] = [];
  let initialTotalCount = 0;

  try {
    const [buildingsRes, depositsRes] = await Promise.all([
      getHostelConfigurations([]),
      getHostelFeeCollections({
        page: 1,
        limit: PAGE_SIZE,
        orderBy: { created_at: "desc" },
      }),
    ]);

    const buildings = extractData(buildingsRes);
    hostelTree = await Promise.all(
      buildings.map(async (b: any) => {
        const buildingDetail = await getHostelConfigurationById(b.id);
        const buildingData: any = buildingDetail?.data ?? buildingDetail;
        const floors = buildingData?.hostelFloors ?? [];

        const floorsWithRooms: HostelTreeFloor[] = floors.map((f: any) => {
          const rooms = f.hostelRooms ?? [];
          return {
            id: f.id,
            label: floorLabel(f),
            rooms: rooms.map((r: any) => ({ id: r.id, label: roomLabel(r) })),
          };
        });

        return {
          id: b.id,
          label: String(b.building_name || b.name || b.id),
          floors: floorsWithRooms,
        };
      }),
    );

    const { records, count } = parseHostelFeeCollectionsResponse(depositsRes);
    initialRows = transformRecordsToRows(records);
    initialTotalCount = count;
  } catch (err) {
    console.error("Failed to load deposited page data:", err);
  }

  return (
    <>
      <PageHeader
        title="Hostel deposited"
        backHref="/dashboard/hostel"
        components={
          <Link
            href="/dashboard/hostel/deposited/collect-fees"
            className="group inline-flex h-11 items-center gap-2 rounded-2xl bg-black px-5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-black/20 active:scale-95"
          >
            Collect Fees
            <ChevronRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        }
      />
      <DepositedPageClient
        hostelTree={hostelTree}
        initialRows={initialRows}
        initialTotalCount={initialTotalCount}
      />
    </>
  );
}