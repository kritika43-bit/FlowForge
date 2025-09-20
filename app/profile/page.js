import { MainLayout } from "../../components/layout/main-layout"
import Profile from "../../components/pages/profile"

export default function ProfilePage() {
  return (
    <MainLayout title="Profile" subtitle="Manage your account and preferences">
      <Profile />
    </MainLayout>
  )
}
