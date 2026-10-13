import mongoose from "mongoose";
import User from "@/models/user.model";
import Student from "@/models/student.model";
import { connectDB } from "@/lib/db"; // your db connector

export async function migrateToBeginner({ dryRun = true }: { dryRun: boolean }) {
  await connectDB();

  // 1. Find all students where student.program!= beginner
  const studentsNotBeginner = await Student.countDocuments({
    program: { $ne: "beginner" }
  });

  // 2. Find all user docs that are students and user.program!= beginner
  const usersNotBeginner = await User.countDocuments({
    role: "student",
    program: { $ne: "beginner" }
  });

  // 3. Union via lookup - students where EITHER side is not beginner
  const mixed = await Student.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDoc"
      }
    },
    { $unwind: "$userDoc" },
    {
      $match: {
        $or: [
          { program: { $ne: "beginner" } },
          { "userDoc.program": { $ne: "beginner" } }
        ]
      }
    },
    { $count: "total" }
  ]);

  const totalAffected = mixed[0]?.total || 0;

  console.log(`[DRY RUN=${dryRun}] Students with program!= beginner: ${studentsNotBeginner}`);
  console.log(`[DRY RUN=${dryRun}] Users(student) with program!= beginner: ${usersNotBeginner}`);
  console.log(`[DRY RUN=${dryRun}] Total students where student.program OR user.program!= beginner: ${totalAffected}`);

  if (dryRun) {
    console.log("Dry run done. No writes. Run again with dryRun:false to execute");
    await mongoose.disconnect();
    return;
  }

  // Safety: prevent double run
  if (totalAffected === 0) {
    console.log("Nothing to migrate. All are already beginner.");
    await mongoose.disconnect();
    return;
  }

  // Actual writes - idempotent
  const studentRes = await Student.updateMany(
    { program: { $ne: "beginner" } },
    { $set: { program: "beginner" } }
  );

  const userRes = await User.updateMany(
    { role: "student", program: { $ne: "beginner" } },
    { $set: { program: "beginner" } }
  );

  // Also fix students whose user was not beginner but student already beginner - userRes already covers
  // Final verification
  const stillNotBeginner = await Student.aggregate([
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDoc" } },
    { $unwind: "$userDoc" },
    { $match: { $or: [{ program: { $ne: "beginner" } }, { "userDoc.program": { $ne: "beginner" } }] } },
    { $count: "total" }
  ]);

  console.log(`Updated Students: ${studentRes.modifiedCount}`);
  console.log(`Updated Users: ${userRes.modifiedCount}`);
  console.log(`Remaining non-beginner: ${stillNotBeginner[0]?.total || 0}`);

  await mongoose.disconnect();
}
