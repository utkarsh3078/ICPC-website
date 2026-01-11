import api from "./axios";

// Types
export interface StudentWithRank {
  id: string;
  email: string;
  createdAt: string;
  name: string;
  branch: string;
  year: number;
  contact: string;
  handles: Record<string, string>;
  totalPoints: number;
  rank: number;
}

export interface AlumniProfile {
  id: string;
  email: string;
  createdAt: string;
  profile: {
    name: string;
    branch: string;
    graduationYear: number | null;
    company: string | null;
    position: string | null;
    location: string | null;
    bio: string | null;
    linkedIn: string | null;
    handles: Record<string, string> | null;
  } | null;
}

export interface RegisterAlumniData {
  email: string;
  password: string;
}

// Get all students with ranks (alumni only)
export const getStudentsWithRanks = async (): Promise<StudentWithRank[]> => {
  const response = await api.get("/alumni/students");
  return response.data.data;
};

// Get all approved alumni
export const getAlumniList = async (): Promise<AlumniProfile[]> => {
  const response = await api.get("/alumni");
  return response.data.data;
};

// Register as alumni (public)
export const registerAsAlumni = async (data: RegisterAlumniData): Promise<void> => {
  await api.post("/alumni/register", data);
};
