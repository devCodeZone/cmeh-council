import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(150),
  mobile: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().max(255).optional().default(""),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(4000),
  website: z.string().max(0).optional(), // honeypot field — must stay empty
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  fathersName: z.string().trim().max(200).optional().default(""),
  mothersName: z.string().trim().max(200).optional().default(""),
  dob: z.string().min(4, "Date of birth is required"),
  gender: z.string().min(1, "Please select gender"),
  nationality: z.string().trim().max(80).default("Indian"),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  altMobile: z.string().trim().optional().default(""),
  email: z.string().trim().email(),
  aadhaarNumber: z.string().trim().optional().default(""), // configurable/optional
  addressLine1: z.string().trim().min(5, "Address is required"),
  city: z.string().trim().min(2),
  district: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code"),
});

export const qualificationSchema = z.object({
  highestQualification: z.string().trim().min(1, "Required"),
  course: z.string().trim().optional().default(""),
  institute: z.string().trim().min(1, "Required"),
  boardUniversity: z.string().trim().min(1, "Required"),
  passingYear: z.string().trim().min(4, "Required"),
  enrollmentNumber: z.string().trim().optional().default(""),
  additionalQualification: z.string().trim().optional().default(""),
});

export const registrationInfoSchema = z.object({
  registrationCategory: z.string().trim().min(1, "Please select a category"),
  courseQualification: z.string().trim().optional().default(""),
  registrationType: z.string().trim().min(1, "Please select a type"),
  previousRegistrationNumber: z.string().trim().optional().default(""),
  institutionDetails: z.string().trim().optional().default(""),
  experience: z.string().trim().optional().default(""),
});

export const declarationSchema = z.object({
  declarationAccepted: z.literal(true, { message: "You must confirm the declaration" }),
  termsAccepted: z.literal(true, { message: "You must agree to the Terms & Privacy Policy" }),
});

export const fullApplicationSchema = z.object({
  personal: personalDetailsSchema,
  qualifications: z.array(qualificationSchema).min(1, "Add at least one qualification"),
  registration: registrationInfoSchema,
  declaration: declarationSchema,
});
export type FullApplicationInput = z.infer<typeof fullApplicationSchema>;

export const simpleRegistrationSchema = z.object({
  sessionYear: z.string().trim().min(4, "Please select a session year"),
  candidateName: z.string().trim().min(2, "Please enter the candidate's name").max(200),
  fathersName: z.string().trim().min(2, "Please enter the father's name").max(200),
  dob: z.string().min(4, "Date of birth is required"),
  nationality: z.string().trim().min(2, "Please enter nationality").max(80),
  religion: z.string().trim().min(2, "Please enter religion").max(80),
  birthPlace: z.string().trim().min(2, "Please enter birth place").max(150),
  permanentAddress: z.string().trim().min(5, "Please enter the permanent address").max(500),
  presentAddress: z.string().trim().min(5, "Please enter the present address").max(500),
  identificationMark: z.string().trim().min(2, "Please enter an identification mark").max(200),
});
export type SimpleRegistrationInput = z.infer<typeof simpleRegistrationSchema>;

export const trackApplicationSchema = z.object({
  applicationNumber: z.string().trim().min(5),
  contact: z.string().trim().min(5, "Enter your registered mobile number or email"),
});
