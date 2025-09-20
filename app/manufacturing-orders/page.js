import { MainLayout } from "../../components/layout/main-layout"
import { ManufacturingOrders } from "../../components/pages/manufacturing-orders"

export default function ManufacturingOrdersPage() {
  return (
    <MainLayout title="Manufacturing Orders" subtitle="Manage and track your production orders">
      <ManufacturingOrders />
    </MainLayout>
  )
}
