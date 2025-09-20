import { MainLayout } from "../../components/layout/main-layout"
import { StockLedger } from "../../components/pages/stock-ledger"

export default function StockLedgerPage() {
  return (
    <MainLayout title="Stock Ledger" subtitle="Track inventory movements and stock levels">
      <StockLedger />
    </MainLayout>
  )
}
