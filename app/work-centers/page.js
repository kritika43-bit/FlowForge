import { MainLayout } from "../../components/layout/main-layout"
import { WorkCenters } from "../../components/pages/work-centers"

export default function WorkCentersPage() {
  return (
    <MainLayout title="Work Centers" subtitle="Monitor machine utilization and capacity">
      <WorkCenters />
    </MainLayout>
  )
}
