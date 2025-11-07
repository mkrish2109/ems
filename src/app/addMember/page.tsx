"use client";

import PageHeader from "@/components/ui/PageHeader";
import { AddMemberForm } from "@/components/forms/AddMemberForm";

export default function AddMember() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg">
        <PageHeader title="Add Member" />
        <AddMemberForm />
      </div>
    </div>
  );
}