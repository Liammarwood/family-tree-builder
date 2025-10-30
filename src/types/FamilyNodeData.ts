export type FamilyNodeData = {
  id: string;
  name: string;
  dateOfBirth: string;
  countryOfBirth?: string;
  gender?: 'Male' | 'Female';
  occupation?: string;
  dateOfDeath?: string; // date of death
  maidenName?: string;
  image?: string; // URL or base64
  // Relationships
  parents?: string[]; // multiple parents
  children?: string[];
  partners?: string[]; // partner node ids
  createdAt?: number;
};