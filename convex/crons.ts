import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "cleanup expired drafts",
  {
    hourUTC: 2, // 2 AM UTC
    minuteUTC: 0,
  },
  internal.articles.cleanupExpiredDrafts
);

export default crons;
