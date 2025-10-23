"use client";

import { Suspense } from "react";
import MemberIncomeContent from "./MemberIncomeContent";

export default function MemberIncome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemberIncomeContent />
    </Suspense>
  );
}