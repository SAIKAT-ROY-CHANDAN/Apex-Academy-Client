"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const createHostelConfiguration = async (payload: FieldValues) => {
  const response = await apiRequest("hostel-configuration/create-building", {
    method: "POST",
    body: JSON.stringify({
      building_name: payload.buildingName,
      total_floors: payload.totalFloor,
    }),
    authRequired: true,
  });

  return response;
};

export const getHostelConfigurations = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, String(param.value));
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `hostel-configuration?${queryParams.toString()}`
      : "hostel-configuration",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getHostelConfigurationById = async (id: string) => {
  const response = await apiRequest(`hostel-configuration/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateHostelConfiguration = async (
  id: string,
  data: FieldValues,
) => {
  const response = await apiRequest(`hostel-configuration/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify({
      building_name: data.buildingName,
      total_floors: data.totalFloor,
    }),
  });

  return response;
};

export const deleteHostelConfiguration = async (id: string) => {
  const response = await apiRequest(`hostel-configuration/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};

export const assignRoomsToFloor = async (payload: FieldValues) => {
  const response = await apiRequest("hostel-configuration/assign-rooms", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  
  return response;
};

export const getHostelFloorById = async (id: string) => {
  const response = await apiRequest(`hostel-configuration/floor/${id}`, {
    method: "GET",
    authRequired: true,
  });
  
  return response;
};

export const getHostelRoomById = async (id: string) => {
  const response = await apiRequest(`hostel-configuration/room/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
