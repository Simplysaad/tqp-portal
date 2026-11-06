"use server";

import connectDB  from "@/lib/db"; // Ensure your DB connection helper is imported
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";

export default async function getData() {
  try {
    await connectDB();

    const [students, tutorGroups] = await Promise.all([
      Student.find({})
        .populate({
          path: "user",
          select: "name email",
        })
        .lean(),

      TutorGroup.find({})
        .populate({
          path: "tutor",
          populate: { path: "user", select: "name email" },
        })
        .populate({
          path: "students",
          select: "name user",
        })
        .lean(),
    ]);

    // Parse to ensure clean JSON serialization (converts ObjectIds & Dates to strings)
    return {
      success: true,
      students: JSON.parse(JSON.stringify(students)),
      tutorGroups: JSON.parse(JSON.stringify(tutorGroups)),
    };
  } catch (error: any) {
    console.error("Error fetching data for reassignment:", error);
    return {
      success: false,
      students: [],
      tutorGroups: [],
    };
  }
}