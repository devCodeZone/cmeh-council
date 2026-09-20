/**
 * Directory of colleges affiliated with the council, grouped by session.
 *
 * Transcribed from "COLLEGE_NAME_LIST.pdf" supplied by the council
 * (Sl.No / College Name / Address / Principal / Mobile / Roll Code / Payment
 * columns in the source document). The Payment column is intentionally
 * excluded here per the council's request — this is a public directory
 * page, not a financial record.
 *
 * Plain static data (not database-backed) so this list always renders even
 * if the database isn't configured.
 */

export type AffiliatedCollege = {
  slNo: string;
  name: string;
  address: string;
  principal: string;
  mobile: string;
  rollCode: string;
};

export type AffiliatedCollegeSession = {
  session: string; // e.g. "2024-2025"
  colleges: AffiliatedCollege[];
};

export const AFFILIATED_COLLEGES: AffiliatedCollegeSession[] = [
  {
    session: "2024-2025",
    colleges: [
      {
        slNo: "1",
        name: "K.E.H. Medical College & Hospital",
        address: "Malhad, Supaul (Bihar) 852131",
        principal: "Dr. N.K. Jha",
        mobile: "8271678781, 9471668958",
        rollCode: "CMC-001",
      },
      {
        slNo: "2",
        name: "N.M.E.H. Medical College & Hospital",
        address: "Badi Devi, Buxar (Bihar) 802101",
        principal: "Dr. R. Rakesh",
        mobile: "9097217878",
        rollCode: "CMC-002",
      },
      {
        slNo: "3",
        name: "B.E.H. Medical College & Hospital",
        address: "Kashyapnagar, Ara (Bihar)",
        principal: "Dr. Sarita Mishra",
        mobile: "6206680312",
        rollCode: "CMC-003",
      },
      {
        slNo: "4",
        name: "Mithila Electro Homoeopathy Medical College & Hospital",
        address: "Singhwara, Darbhanga (Bihar) 847123",
        principal: "Dr. A. Kumar",
        mobile: "9334931657",
        rollCode: "CMC-004",
      },
      {
        slNo: "5",
        name: "Mattei Electro Homoeopathic Medical College & Hospital",
        address: "1, Rani Pokhar, Bokaro (J.H), Quarter No. 2115, Street-23, Sector 8B, Bokaro Steel City (J.H) 827009",
        principal: "Dr. J. Mandal",
        mobile: "9835345575",
        rollCode: "CMC-005",
      },
      {
        slNo: "6",
        name: "Maa Janki Electro Homoeopathic Medical College & Hospital",
        address: "Sitamarhi (Chakmahila) (Bihar) 843302",
        principal: "Dr. Vinod Kumar",
        mobile: "9801414159",
        rollCode: "CMC-006",
      },
      {
        slNo: "7",
        name: "Maurya Electrohomeopathic Medical College & Hospital",
        address: "Sasaram (Bihar)",
        principal: "Dr. Om Prakash",
        mobile: "9661329166",
        rollCode: "CMC-007",
      },
    ],
  },
  {
    session: "2025-2026",
    colleges: [
      {
        slNo: "8",
        name: "Anand Electrohomeopathic Medical College & Hospital",
        address: "Kahra Ward 41, Saharsa (Bihar)",
        principal: "Prabhat Anand",
        mobile: "9570899560",
        rollCode: "CMC-008",
      },
    ],
  },
];
