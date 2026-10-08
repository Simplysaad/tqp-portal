import React from "react";
import ReassignStudentForm from "./ReassignForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reassign Students | TQP Admin",
  description:
    "Reassign students to tutor groups according to capacity, gender restrictions, and memorisation levels.",
};

const ReassignStudentPage = () => {
  return (
    <div>
      <ReassignStudentForm />
    </div>
  );
};

export default ReassignStudentPage;
