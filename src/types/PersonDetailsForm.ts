export type PersonDetailsForm = {
  name: string;
  dateOfBirth: string;
  countryOfBirth: string;
  gender: 'Male' | 'Female';
  occupation: string;
  maidenName: string;
  dateOfDeath: string;
  dateOfMarriage: string;
  dateOfDivorce: string;
  image?: string;
}