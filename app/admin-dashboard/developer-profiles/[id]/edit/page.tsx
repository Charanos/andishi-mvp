"use client";

import { useParams } from "next/navigation";
import DeveloperProfileEditor from "../../../DeveloperProfileEditor";

export default function EditDeveloperProfilePage() {
  const params = useParams();
  const { id } = params as { id: string };

  if (!id) {
    return (
      <p className="text-center py-8 text-red-400">Invalid developer id.</p>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Edit Developer Profile
      </h1>
      <DeveloperProfileEditor profileId={id} />
    </div>
  );
}
