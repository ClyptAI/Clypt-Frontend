import { Outlet } from "react-router-dom";
import SettingsNav from "@/components/settings/SettingsNav";

export default function SettingsLayout() {
  return (
    <div style={{ display: "flex", flex: 1, height: "100%", overflow: "hidden" }}>
      <SettingsNav />
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
        <Outlet />
      </div>
    </div>
  );
}
