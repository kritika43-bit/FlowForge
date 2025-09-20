import { MainLayout } from "../../components/layout/main-layout"
import { Reports } from "../../components/pages/reports"

export default function ReportsPage() {
  return (
    <MainLayout title="Reports" subtitle="Analytics and performance insights">
      <Reports />
    </MainLayout>
  )
}
