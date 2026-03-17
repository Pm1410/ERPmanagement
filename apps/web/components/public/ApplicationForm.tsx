"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronRight, ChevronLeft, Save, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

// Zod schemas per step
const step1Schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationality: z.string().min(2, "Nationality is required"),
});

const step2Schema = z.object({
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip Code is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required"),
});

const step3Schema = z.object({
  previousSchool: z.string().min(2, "Previous school is required"),
  gradeApplyingFor: z.string().min(1, "Grade is required"),
});

const step4Schema = z.object({
  parentName: z.string().min(2, "Parent/Guardian Name is required"),
  relationship: z.string().min(2, "Relationship to student is required"),
  parentOccupation: z.string().min(2, "Occupation is required"),
  parentPhone: z.string().min(10, "Phone number is required"),
  parentEmail: z.string().email("Valid email is required"),
});

const step5Schema = z.object({
  declaration: z.boolean().refine(val => val === true, "You must agree to the declaration"),
});

// A combined schema for the entire form
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema).merge(step5Schema);
type ApplicationFormValues = z.infer<typeof fullSchema>;

const STEPS = [
  { id: 1, title: "Personal Info" },
  { id: 2, title: "Contact Info" },
  { id: 3, title: "Academics" },
  { id: 4, title: "Guardian" },
  { id: 5, title: "Review" },
];

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(fullSchema),
    mode: "onBlur",
    defaultValues: {
      gender: "MALE",
      declaration: false,
    }
  });

  const { register, trigger, handleSubmit, formState: { errors }, watch } = form;

  const nextStep = async () => {
    let isValid = false;
    switch(currentStep) {
      case 1: isValid = await trigger(["firstName", "lastName", "dob", "gender", "nationality"]); break;
      case 2: isValid = await trigger(["address", "city", "state", "zipCode", "phone", "email"]); break;
      case 3: isValid = await trigger(["previousSchool", "gradeApplyingFor"]); break;
      case 4: isValid = await trigger(["parentName", "relationship", "parentOccupation", "parentPhone", "parentEmail"]); break;
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    // Simulate API call to POST /api/admissions/apply
    await new Promise(res => setTimeout(res, 2000));
    const randomAppId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
    setIsSubmitting(false);
    router.push(`/track-application?id=${randomAppId}`);
  };

  const handleSaveDraft = () => {
    // Save current values to localStorage
    const data = form.getValues();
    localStorage.setItem("applicationDraft", JSON.stringify(data));
    alert("Draft saved to your browser!");
  };

  return (
    <div className="bg-white rounded-3xl shadow-card border border-border/50 overflow-hidden">
      
      {/* Progress Bar Header */}
      <div className="bg-neutral-50 border-b border-border/50 px-6 py-8 md:px-12 relative overflow-hidden">
        {/* Animated background bar */}
        <div 
           className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500" 
           style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        ></div>

        <div className="flex justify-between items-center relative z-10 hidden md:flex">
          {STEPS.map((s, idx) => {
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            
            return (
              <div key={s.id} className="flex flex-col items-center relative gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors z-10 
                  ${isActive ? "bg-primary text-white shadow-xl shadow-primary/30 ring-4 ring-primary/20" : 
                    isCompleted ? "bg-success text-white" : "bg-neutral-200 text-neutral-500"}`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-neutral-500"}`}>
                  {s.title}
                </span>

                {/* Connecting Line */}
                {idx < STEPS.length - 1 && (
                  <div className={`absolute top-5 left-10 w-full h-[2px] -z-10 bg-neutral-200`} style={{ width: 'calc(100% + 80px)'}}>
                      <div className={`h-full bg-success transition-all duration-500`} style={{ width: isCompleted ? '100%' : '0%' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden text-center">
           <span className="text-sm font-semibold text-primary mb-1 block">Step {currentStep} of {STEPS.length}</span>
           <h3 className="text-xl font-bold">{STEPS[currentStep - 1].title}</h3>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* STEP 1 */}
          <div className={currentStep === 1 ? "block space-y-6 animate-in fade-in" : "hidden"}>
            <h3 className="text-2xl font-bold mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input type="text" {...register("firstName")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.firstName && <p className="text-xs text-danger">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input type="text" {...register("lastName")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.lastName && <p className="text-xs text-danger">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input type="date" {...register("dob")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.dob && <p className="text-xs text-danger">{errors.dob.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select {...register("gender")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary bg-background">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-danger">{errors.gender.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Nationality</label>
                <input type="text" {...register("nationality")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.nationality && <p className="text-xs text-danger">{errors.nationality.message}</p>}
              </div>
               {/* Photo Upload Placeholder */}
               <div className="space-y-2 md:col-span-2 mt-4">
                <label className="text-sm font-medium">Passport Size Photo</label>
                <div className="border-2 border-dashed border-input rounded-xl p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-neutral-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={currentStep === 2 ? "block space-y-6 animate-in fade-in slide-in-from-right-4" : "hidden"}>
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Residential Address</label>
                <textarea rows={3} {...register("address")} className="w-full p-4 rounded-md border border-input focus:ring-2 focus:ring-primary resize-none" />
                {errors.address && <p className="text-xs text-danger">{errors.address.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <input type="text" {...register("city")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.city && <p className="text-xs text-danger">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State / Province</label>
                <input type="text" {...register("state")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.state && <p className="text-xs text-danger">{errors.state.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Zip / Postal Code</label>
                <input type="text" {...register("zipCode")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.zipCode && <p className="text-xs text-danger">{errors.zipCode.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Student Phone Number (Optional)</label>
                <input type="text" {...register("phone")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Student Email Address</label>
                <input type="email" {...register("email")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={currentStep === 3 ? "block space-y-6 animate-in fade-in slide-in-from-right-4" : "hidden"}>
             <h3 className="text-2xl font-bold mb-6">Academic History</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Previous School Attended</label>
                  <input type="text" {...register("previousSchool")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                  {errors.previousSchool && <p className="text-xs text-danger">{errors.previousSchool.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade Applying For</label>
                   <select {...register("gradeApplyingFor")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary bg-background">
                    <option value="">Select Grade</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                  {errors.gradeApplyingFor && <p className="text-xs text-danger">{errors.gradeApplyingFor.message}</p>}
                </div>
                {/* File Upload Placeholder */}
               <div className="space-y-2 md:col-span-2 mt-4">
                <label className="text-sm font-medium">Previous Academic Transcripts</label>
                <div className="border-2 border-dashed border-input rounded-xl p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">Upload PDF Transcripts</p>
                </div>
              </div>
             </div>
          </div>

          {/* STEP 4 */}
          <div className={currentStep === 4 ? "block space-y-6 animate-in fade-in slide-in-from-right-4" : "hidden"}>
             <h3 className="text-2xl font-bold mb-6">Parent / Guardian Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input type="text" {...register("parentName")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                  {errors.parentName && <p className="text-xs text-danger">{errors.parentName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relationship to Student</label>
                   <select {...register("relationship")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary bg-background">
                    <option value="">Select</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                  </select>
                  {errors.relationship && <p className="text-xs text-danger">{errors.relationship.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Occupation</label>
                  <input type="text" {...register("parentOccupation")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                  {errors.parentOccupation && <p className="text-xs text-danger">{errors.parentOccupation.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Emergency Phone</label>
                  <input type="text" {...register("parentPhone")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                  {errors.parentPhone && <p className="text-xs text-danger">{errors.parentPhone.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" {...register("parentEmail")} className="w-full h-11 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary" />
                  {errors.parentEmail && <p className="text-xs text-danger">{errors.parentEmail.message}</p>}
                </div>
             </div>
          </div>

          {/* STEP 5 */}
          <div className={currentStep === 5 ? "block space-y-8 animate-in fade-in slide-in-from-right-4" : "hidden"}>
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold">Review & Submit</h3>
               <p className="text-neutral-500 mt-2">Please double-check your information before submitting.</p>
             </div>

             <div className="bg-neutral-50 rounded-xl p-6 border border-border/50 space-y-6">
                
                {/* Data Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                  <div><span className="text-xs text-neutral-500 uppercase font-semibold">Student Name:</span><br/><span className="font-semibold text-sm">{watch("firstName")} {watch("lastName")}</span></div>
                  <div><span className="text-xs text-neutral-500 uppercase font-semibold">DOB:</span><br/><span className="font-semibold text-sm">{watch("dob")}</span></div>
                  <div><span className="text-xs text-neutral-500 uppercase font-semibold">Applying For:</span><br/><span className="font-semibold text-sm">{watch("gradeApplyingFor")}</span></div>
                  <div><span className="text-xs text-neutral-500 uppercase font-semibold">Guardian:</span><br/><span className="font-semibold text-sm">{watch("parentName")} ({watch("relationship")})</span></div>
                  <div className="col-span-2 md:col-span-4"><span className="text-xs text-neutral-500 uppercase font-semibold">Address:</span><br/><span className="font-semibold text-sm">{watch("address")}, {watch("city")}, {watch("state")} {watch("zipCode")}</span></div>
                </div>
             </div>

             <div className="flex items-start bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div className="flex items-center h-5 mt-0.5">
                  <input id="declaration" type="checkbox" {...register("declaration")} className="w-5 h-5 rounded border-input focus:ring-primary text-primary cursor-pointer"/>
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="declaration" className="font-medium text-foreground cursor-pointer">Declaration of Authenticity</label>
                  <p className="text-neutral-500 mt-1">I hereby declare that the information provided in this application is true, complete, and correct to the best of my knowledge and belief. I understand that any false information or omission may lead to the rejection of my application.</p>
                </div>
             </div>
             {errors.declaration && <p className="text-xs text-danger">{errors.declaration.message}</p>}
          </div>

          {/* Form Actions */}
          <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
            <div>
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="text-sm font-semibold flex items-center text-neutral-500 hover:text-foreground transition-colors px-4 py-2 hover:bg-neutral-100 rounded-md"
              >
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </button>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="px-6 py-2.5 rounded-md border border-input text-foreground font-semibold flex-1 sm:flex-none hover:bg-neutral-50"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-4 h-4 inline-block -ml-1 mr-1" /> Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="px-8 py-2.5 rounded-md bg-primary text-white font-semibold flex-1 sm:flex-none hover:bg-primary/90 shadow transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4 inline-block ml-1 -mr-1" />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-md bg-success text-white font-semibold flex-1 sm:flex-none hover:bg-success/90 shadow-lg shadow-success/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2"></span> Submitting</>
                  ) : "Submit Application"}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
