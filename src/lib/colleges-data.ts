/**
 * Colleges / office-bearers directory shown on the public /colleges page.
 *
 * This is plain static data (not database-backed) so the page always works
 * even if the database isn't configured — consistent with keeping the
 * public site simple and dependency-free wherever possible.
 *
 * Transcribed from a handwritten register supplied by the council. Two
 * mobile numbers were hard to read clearly in the handwriting and are
 * marked below — please double-check them against the original register
 * before treating this page as final, since a wrong published number could
 * mislead someone trying to reach that person.
 */

export type CollegeDoctor = {
  name: string;
  designation: string;
  experience?: string; // e.g. "10 years"
  mobile?: string;
};

export type College = {
  name: string;
  doctors: CollegeDoctor[];
};

export const COLLEGES: College[] = [
  {
    name: "M.D.E.H.",
    doctors: [
      { name: "Dr. Raushan Rakesh", designation: "Director & Secretary", experience: "10 years", mobile: "7591068125" },
      { name: "Dr. Nishant Kr. Jha", designation: "Director & Vice President", experience: "25 years", mobile: "8223498781" }, // [VERIFY] handwriting unclear
      { name: "Dr. Noopur Rakesh", designation: "Accountant & Vice President", experience: "10 years", mobile: "8507660899" },
      { name: "Dr. Ajeet Kumar", designation: "Registrar & Vice President", experience: "8 years", mobile: "6206738951" },
      { name: "Dr. Sarita Mishra", designation: "Office Incharge & Vice President", experience: "9 years", mobile: "7759807100" },
      { name: "Dr. Abhay Kr. Pandey", designation: "Vice President & IT Sector", experience: "12 years", mobile: "9738296451" }, // [VERIFY] handwriting unclear
      { name: "Dr. Nalini Rakesh", designation: "Vice President", mobile: "8216516638" },
      { name: "Dr. Anil Kr. Jha", designation: "President", experience: "10 years" },
    ],
  },
];
