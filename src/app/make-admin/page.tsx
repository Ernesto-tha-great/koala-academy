// // app/make-admin/page.tsx
// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { Button } from "@/components/ui/button";

// export default function MakeAdmin() {
//   const { user } = useUser();
//   const convexUser = useQuery(api.auth.getUser);
//   const updateRole = useMutation(api.auth.updateRole);

//   const makeAdmin = async () => {
//     if (!user) return;
    
//     try {
//       await updateRole({
//         userId: user.id,
//         role: "admin"
//       });
//       window.location.reload(); // Refresh to see changes
//     } catch (error) {
//       console.error("Failed to set admin role:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="text-center space-y-4">
//         <h1 className="text-2xl font-bold">Admin Setup</h1>
//         <p>Current role: {convexUser?.role || "loading..."}</p>
//         <Button onClick={makeAdmin}>Make Admin</Button>
//       </div>
//     </div>
//   );
// }

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page