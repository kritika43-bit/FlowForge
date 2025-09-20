import { MainLayout } from "../../components/layout/main-layout"
import { BOM } from "../../components/pages/bom"

export default function BOMPage() {
  return (
    <MainLayout title="BOM" subtitle="Manage bill of materials and recipes">
      <BOM />
    </MainLayout>
  )
}
