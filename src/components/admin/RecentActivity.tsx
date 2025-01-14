// "use client";

// import { useQuery } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { formatDate } from "@/lib/utils";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// export function RecentActivity() {
//   const activities = useQuery(api.admin.getRecentActivity, { limit: 10 });

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Recent Activity</CardTitle>
//         <CardDescription>Latest actions across the platform</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {activities?.map((activity) => (
//             <div
//               key={activity._id}
//               className="flex items-center justify-between py-2"
//             >
//               <div>
//                 <p className="font-medium">{activity.action}</p>
//                 <p className="text-sm text-muted-foreground">
//                   by 
//                 </p>
//               </div>
//               <time className="text-sm text-muted-foreground">
//                 {formatDate(activity.timestamp)}
//               </time>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }