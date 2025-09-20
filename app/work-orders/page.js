import { MainLayout } from "../../components/layout/main-layout"
import { WorkOrders } from "../../components/pages/work-orders"

export default function WorkOrdersPage() {
  return (
    <MainLayout title="Work Orders" subtitle="Organize tasks and workflow stages">
      <WorkOrders />
    </MainLayout>
  )
}
