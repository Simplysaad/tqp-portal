import Student from "@/models/student.model";
import connectDB from "@/lib/db";

export async function getAnalyticsData() {
  await connectDB();

  const [
    byJuzTime,
    byJuzGender,
    byProgram,
    byStatus,
    byFaculty,
    byLevel,
    tutorCoverage,
    total,
    registrationRaw,
    byJuzLevel
  ] = await Promise.all([
    // Juz x PreferredTime
    Student.aggregate([
      { $match: { "currentMemorization.juz": { $gte: 1, $lte: 30 } } },
      { $group: { _id: { juz: "$currentMemorization.juz", time: "$preferredTime" }, count: { $sum: 1 } } },
      { $sort: { "_id.juz": 1 } },
      { $project: { _id: 0, juz: "$_id.juz", time: "$_id.time", count: 1 } }
    ]),
    // Juz x Gender
    Student.aggregate([
      { $match: { "currentMemorization.juz": { $gte: 1, $lte: 30 } } },
      { $group: { _id: { juz: "$currentMemorization.juz", gender: "$gender" }, count: { $sum: 1 } } },
      { $sort: { "_id.juz": 1 } },
      { $project: { _id: 0, juz: "$_id.juz", gender: "$_id.gender", count: 1 } }
    ]),
    Student.aggregate([{ $group: { _id: "$program", count: { $sum: 1 } } }]),
    Student.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Student.aggregate([
      { $group: { _id: "$faculty", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Student.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Student.aggregate([
      { $group: { _id: { hasTutor: { $cond: [{ $ne: ["$tutor", null] }, "assigned", "unassigned"] } }, count: { $sum: 1 } } }
    ]),
    Student.countDocuments(),
    Student.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $limit: 30 }
    ]),
    Student.aggregate([
      { $match: { "currentMemorization.juz": { $gte: 1, $lte: 30 } } },
      { $group: { _id: { juz: "$currentMemorization.juz", level: "$level" }, count: { $sum: 1 } } },
      { $sort: { "_id.juz": 1 } },
      { $project: { _id: 0, juz: "$_id.juz", level: "$_id.level", count: 1 } }
    ])
  ]);

  // Pivot for stacked bar
  const juzTimePivot = Array.from({ length: 30 }, (_, i) => {
    const juz = i + 1;
    const rows = byJuzTime.filter((r: any) => r.juz === juz);
    return {
      juz: `Juz ${juz}`,
      juzNum: juz,
      morning: rows.find((r: any) => r.time === "morning")?.count || 0,
      afternoon: rows.find((r: any) => r.time === "afternoon")?.count || 0,
      night: rows.find((r: any) => r.time === "night")?.count || 0,
      total: rows.reduce((s: number, r: any) => s + r.count, 0)
    };
  });

  const juzGenderPivot = Array.from({ length: 30 }, (_, i) => {
    const juz = i + 1;
    const rows = byJuzGender.filter((r: any) => r.juz === juz);
    return {
      juz: `Juz ${juz}`,
      juzNum: juz,
      male: rows.find((r: any) => r.gender === "male")?.count || 0,
      female: rows.find((r: any) => r.gender === "female")?.count || 0,
      total: rows.reduce((s: number, r: any) => s + r.count, 0)
    };
  });

  const registrationTrend = registrationRaw;

  const levelPivot = Array.from({ length: 30 }, (_, i) => {
    const juz = i + 1;
    const rows = byJuzLevel.filter((r: any) => r.juz === juz);
    return {
      juz: `Juz ${juz}`,
      juzNum: juz,
      100: rows.find((r: any) => r.level === 100)?.count || 0,
      200: rows.find((r: any) => r.level === 200)?.count || 0,
      300: rows.find((r: any) => r.level === 300)?.count || 0,
      400: rows.find((r: any) => r.level === 400)?.count || 0,
      500: rows.find((r: any) => r.level === 500)?.count || 0,
      total: rows.reduce((s: number, r: any) => s + r.count, 0)
    };
  });

  return {
    juzTimePivot,
    juzGenderPivot,
    byProgram,
    byStatus,
    byFaculty,
    byLevel,
    tutorCoverage,
    total,
    registrationTrend,
    levelPivot
  };
}