import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import LoadingScreen from './components/common/LoadingScreen.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PermissionRoute from './routes/PermissionRoute.jsx';
import { getDefaultRoute } from './utils/permissions.js';
import { useSelector } from 'react-redux';

const LoginPage = lazy(() => import('./features/auth/LoginPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage.jsx'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage.jsx'));
const StoreListPage = lazy(() => import('./features/stores/StoreListPage.jsx'));
const StoreDetailsPage = lazy(() => import('./features/stores/StoreDetailsPage.jsx'));
const StoreFormPage = lazy(() => import('./features/stores/StoreFormPage.jsx'));
const ProductsPage = lazy(() => import('./features/products/ProductsPage.jsx'));
const BarcodeLabelsPage = lazy(() => import('./features/products/BarcodeLabelsPage.jsx'));
const CategoryFormPage = lazy(() => import('./features/products/CategoryFormPage.jsx'));
const ProductFormPage = lazy(() => import('./features/products/ProductFormPage.jsx'));
const VariationFormPage = lazy(() => import('./features/products/VariationFormPage.jsx'));
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage.jsx'));
const ReceiveStockPage = lazy(() => import('./features/inventory/ReceiveStockPage.jsx'));
const StockTransfersPage = lazy(() => import('./features/inventory/StockTransfersPage.jsx'));
const StockTransferFormPage = lazy(() => import('./features/inventory/StockTransferFormPage.jsx'));
const PointOfSalePage = lazy(() => import('./features/sales/PointOfSalePage.jsx'));
const SalesApprovalsPage = lazy(() => import('./features/sales/SalesApprovalsPage.jsx'));
const SalesApprovalDetailsPage = lazy(() => import('./features/sales/SalesApprovalDetailsPage.jsx'));
const SalesHistoryPage = lazy(() => import('./features/sales/SalesHistoryPage.jsx'));
const ReceiptPreviewPage = lazy(() => import('./features/sales/ReceiptPreviewPage.jsx'));
const ReturnsRefundsPage = lazy(() => import('./features/sales/ReturnsRefundsPage.jsx'));
const ReturnFormPage = lazy(() => import('./features/sales/ReturnFormPage.jsx'));
const RefundFormPage = lazy(() => import('./features/sales/RefundFormPage.jsx'));
const ShiftsPage = lazy(() => import('./features/sales/ShiftsPage.jsx'));
const ShiftOpenPage = lazy(() => import('./features/sales/ShiftOpenPage.jsx'));
const ShiftClosePage = lazy(() => import('./features/sales/ShiftClosePage.jsx'));
const OnlineSalesPage = lazy(() => import('./features/onlineSales/OnlineSalesPage.jsx'));
const OnlineOrderFormPage = lazy(() => import('./features/onlineSales/OnlineOrderFormPage.jsx'));
const SalesChannelFormPage = lazy(() => import('./features/onlineSales/SalesChannelFormPage.jsx'));
const CustomersPage = lazy(() => import('./features/customers/CustomersPage.jsx'));
const CustomerFormPage = lazy(() => import('./features/customers/CustomerFormPage.jsx'));
const CreditSalesPage = lazy(() => import('./features/creditSales/CreditSalesPage.jsx'));
const CreditSaleFormPage = lazy(() => import('./features/creditSales/CreditSaleFormPage.jsx'));
const CreditPaymentFormPage = lazy(() => import('./features/creditSales/CreditPaymentFormPage.jsx'));
const ExpensesPage = lazy(() => import('./features/expenses/ExpensesPage.jsx'));
const ExpenseFormPage = lazy(() => import('./features/expenses/ExpenseFormPage.jsx'));
const StaffPage = lazy(() => import('./features/staff/StaffPage.jsx'));
const StaffFormPage = lazy(() => import('./features/staff/StaffFormPage.jsx'));
const RoleFormPage = lazy(() => import('./features/staff/RoleFormPage.jsx'));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage.jsx'));

export default function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={getDefaultRoute(user)} replace />} />
          <Route path="dashboard" element={<PermissionRoute permissions="dashboard:read"><DashboardPage /></PermissionRoute>} />
          <Route path="stores" element={<StoreListPage />} />
          <Route path="stores/new" element={<StoreFormPage />} />
          <Route path="stores/:storeId/edit" element={<StoreFormPage />} />
          <Route path="stores/:storeId/reports" element={<PermissionRoute permissions="reports:read"><ReportsPage /></PermissionRoute>} />
          <Route path="stores/:storeId" element={<StoreDetailsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/categories/new" element={<CategoryFormPage />} />
          <Route path="products/variations/new" element={<VariationFormPage />} />
          <Route path="products/barcodes" element={<BarcodeLabelsPage />} />
          <Route path="products/*" element={<ProductsPage />} />
          <Route path="inventory/receive" element={<ReceiveStockPage />} />
          <Route path="inventory/transfers/new" element={<StockTransferFormPage />} />
          <Route path="inventory/transfers" element={<StockTransfersPage />} />
          <Route path="inventory/*" element={<InventoryPage />} />
          <Route path="sales/pos" element={<PermissionRoute permissions="sales:create"><PointOfSalePage /></PermissionRoute>} />
          <Route path="sales/approvals" element={<PermissionRoute permissions="system:*"><SalesApprovalsPage /></PermissionRoute>} />
          <Route path="sales/approvals/:saleId" element={<PermissionRoute permissions="system:*"><SalesApprovalDetailsPage /></PermissionRoute>} />
          <Route path="sales/history" element={<SalesHistoryPage />} />
          <Route path="sales/:saleId/receipt" element={<ReceiptPreviewPage />} />
          <Route path="sales/returns-refunds/new" element={<ReturnFormPage />} />
          <Route path="sales/refunds/new" element={<RefundFormPage />} />
          <Route path="sales/returns-refunds" element={<ReturnsRefundsPage />} />
          <Route path="sales/shifts/open" element={<ShiftOpenPage />} />
          <Route path="sales/shifts/:shiftId/close" element={<ShiftClosePage />} />
          <Route path="sales/shifts" element={<ShiftsPage />} />
          <Route path="online-sales/new" element={<OnlineOrderFormPage />} />
          <Route path="online-sales/channels/new" element={<PermissionRoute permissions="sales-channels:create"><SalesChannelFormPage /></PermissionRoute>} />
          <Route path="online-sales/*" element={<OnlineSalesPage />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/*" element={<CustomersPage />} />
          <Route path="credit-sales/new" element={<CreditSaleFormPage />} />
          <Route path="credit-sales/payments/new" element={<CreditPaymentFormPage />} />
          <Route path="credit-sales/*" element={<CreditSalesPage />} />
          <Route path="expenses/new" element={<ExpenseFormPage />} />
          <Route path="expenses/*" element={<ExpensesPage />} />
          <Route path="staff/new" element={<StaffFormPage />} />
          <Route path="staff/roles/new" element={<RoleFormPage />} />
          <Route path="staff/roles/:roleId/edit" element={<RoleFormPage />} />
          <Route path="staff/*" element={<StaffPage />} />
          <Route path="reports/*" element={<PermissionRoute permissions="reports:read"><ReportsPage /></PermissionRoute>} />
          <Route path="settings/*" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
