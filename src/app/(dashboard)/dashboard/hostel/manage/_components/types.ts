export type HostelRoom = {
  id: string;
  hostel_room_number: string;
  available_sits: number;
  hostel_floor_id: string;
};

export type HostelFloor = {
  id: string;
  floor_number: number;
  hostel_total_rooms: number;
  hostel_configuration_id: string;
  hostelRooms: HostelRoom[];
};

export type HostelBuilding = {
  id: string;
  building_name: string;
  total_floors: number;
  hostelFloors: HostelFloor[];
};

export type HostelStudentRecord = {
  id: string;
  name: string;
  allocation_id?: string;
  sit?: string;
  father_name?: string;
  mother_name?: string;
  gender?: string;
  student_phone?: string;
  is_active?: boolean;
  class_name?: string;
  department_name?: string;
  batch_name?: string;
  year_name?: string;
  section_name?: string;
  building_id?: string;
  building_name?: string;
  floor_id?: string;
  floor_number?: number;
  room_id?: string;
  hostel_room_number?: string;
};

export type HostelAllocationStatus = "ACTIVE" | "RELOCATED" | "CHECKED_OUT";

export type HostelAllocationHistory = {
  id: string;
  sit?: string | null;
  allocated_at: string;
  released_at?: string | null;
  status: HostelAllocationStatus;
  created_at: string;
  hostelRoom: {
    id: string;
    hostel_room_number: string;
    hostelFloor: {
      id: string;
      hostel_floor_number: number;
      hostelConfiguration: {
        id: string;
        building_name: string;
      };
    };
  };
};

export type StudentSearchByEmailResult = {
  id: string;
  name: string;
  email?: string;
  studentEnrollments?: Array<{
    registration_number?: string;
    roll_number?: string;
  }>;
};

export const formatStudentSearchLabel = (
  student: StudentSearchByEmailResult,
) => {
  const enrollment = student.studentEnrollments?.[0];
  const regNo = enrollment?.registration_number;
  const parts = [student.name, regNo ? `Reg: ${regNo}` : null].filter(Boolean);

  return parts.join(" • ");
};
