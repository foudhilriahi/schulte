import DashboardLayout from "@/components/hr/DashboardLayout";
import KanbanBoard from "@/components/hr/KanbanBoard";

const ApplicationsPage = () => {
  return (
    <DashboardLayout title="Candidatures">
      <KanbanBoard />
    </DashboardLayout>
  );
};

export default ApplicationsPage;
