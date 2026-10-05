import type { PropertyType, Role } from "./types";

export const APP_NAME = "Fanecto";

export const RENTAL_FEE_RATE = 0.05;
export const INSPECTION_PLATFORM_RATE = 0.2;
export const ROOMMATE_CONNECTION_FEE = 3000;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "self-contain", label: "Self-contain" },
  { value: "mini-flat", label: "Mini-flat" },
  { value: "studio", label: "Studio" },
  { value: "flat", label: "Flat / apartment" },
  { value: "shared-room", label: "Shared room" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
];

export const AMENITIES = [
  "Running water",
  "Prepaid meter",
  "Generator",
  "Estate security",
  "Fitted kitchen",
  "Wardrobe",
  "Parking",
  "Wi-Fi",
  "Pop ceiling",
  "Tiled floors",
  "Water heater",
  "Air conditioning",
  "Balcony",
  "Close to campus",
  "Furnished",
] as const;

export const NIGERIAN_STATES = [
  "Lagos",
  "FCT",
  "Rivers",
  "Oyo",
  "Ogun",
  "Enugu",
  "Kaduna",
  "Anambra",
] as const;

export const AREAS_BY_STATE: Record<string, string[]> = {
  Lagos: [
    "Yaba",
    "Akoka",
    "Surulere",
    "Ikeja",
    "Lekki",
    "Victoria Island",
    "Gbagada",
    "Magodo",
    "Maryland",
    "Bariga",
    "Onike",
    "Jibowu",
  ],
  FCT: ["Wuse 2", "Gwarinpa", "Maitama", "Utako", "Jabi", "Garki", "Kubwa"],
  Rivers: ["GRA Phase 2", "Old GRA", "Rumuola", "Ada George"],
  Oyo: ["Bodija", "UI Area", "Agbowo", "Iwo Road"],
  Ogun: ["Abeokuta", "Sango", "Ibafo"],
  Enugu: ["UNN Nsukka", "Independence Layout", "New Haven"],
  Kaduna: ["Samaru", "Zaria City", "Kaduna North"],
  Anambra: ["Awka", "Ifite", "Nnamdi Azikiwe University"],
};

export const SCHOOLS = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "Lagos State University (LASU)",
  "University of Abuja",
  "University of Port Harcourt",
  "Covenant University",
  "University of Benin (UNIBEN)",
];

export const ROLE_HOME: Record<Role, string> = {
  student: "/dashboard",
  seeker: "/dashboard",
  landlord: "/landlord",
  agent: "/agent",
  inspector: "/inspector/dashboard",
  admin: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  seeker: "Apartment seeker",
  landlord: "Landlord",
  agent: "Agent",
  inspector: "Inspector",
  admin: "Admin",
};
