"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import NotificationList from "@/components/NotificationList";

export default function NotificationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNotificationUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-[#008dd2]/10 shadow-lg overflow-hidden flex flex-col">
        <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
          <PageHeader title="Notifications" />
        </div>

        <div className="flex-1">
          <NotificationList
            maxItems={15}
            showActions={true}
            onNotificationUpdate={handleNotificationUpdate}
            key={refreshKey}
            containerHeight={700}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
