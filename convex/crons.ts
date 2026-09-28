import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Scheduled posts publish via ctx.scheduler.runAt; this only catches anything that slipped through.
crons.interval("publish overdue scheduled articles", { minutes: 10 }, internal.articles.sweepOverdue);

export default crons;
