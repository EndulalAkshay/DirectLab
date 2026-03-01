import { useAuth } from "@/lib/auth";
import PatientDashboard from "@/components/dashboards/PatientDashboard";
import LabDashboard from "@/components/dashboards/LabDashboard";
import CollectorDashboard from "@/components/dashboards/CollectorDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  switch (role) {
    case "patient":
      return <PatientDashboard />;
    case "lab":
      return <LabDashboard />;
    case "collector":
      return <CollectorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="container mx-auto p-8 text-center">
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      );
  }
}
