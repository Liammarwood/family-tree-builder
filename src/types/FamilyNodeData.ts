export type FamilyNodeData = {
  id: string;
  name: string;
  dob: string;
  countryOfBirth?: string;
  gender?: 'Male' | 'Female';
  occupation?: string;
  dod?: string; // date of death
  maidenName?: string;
  photo?: string; // URL or base64
  // Relationships
  parents?: string[]; // multiple parents
  children: string[];
  partners?: string[]; // partner node ids
  createdAt?: number;
};