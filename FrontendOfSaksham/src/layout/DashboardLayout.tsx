import { Outlet } from "react-router-dom";

export default function DashboardLayout(): JSX.Element {
  return (
    <div className="flex">
      
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}