import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
        <Outlet />
      </main>
    </div>
  );
}
