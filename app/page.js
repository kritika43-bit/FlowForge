import { MainLayout } from "../components/layout/main-layout"
import { Dashboard } from "../components/pages/dashboard-simple"

export default function Home() {
  return (
    <MainLayout title="Dashboard" subtitle="Welcome back! Here's your manufacturing overview">
      <Dashboard />
    </MainLayout>
  )
}
