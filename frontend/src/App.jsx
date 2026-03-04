import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './i18n'
import PublicMenu from './pages/public/Menu'
import CategoryItems from './pages/public/CategoryItems'
import Login from './pages/admin/Login'
import Register from './pages/admin/Register'
import Dashboard from './pages/admin/Dashboard'
import Categories from './pages/admin/Categories'
import Subcategories from './pages/admin/Subcategories'
import Items from './pages/admin/Items'
import Settings from './pages/admin/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/menu/:slug" element={<PublicMenu />} />
          <Route path="/menu/:slug/category/:categoryId" element={<CategoryItems />} />
          
          {/* Auth routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          
          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/admin/categories/:categoryId/subcategories" element={<ProtectedRoute><Subcategories /></ProtectedRoute>} />
          <Route path="/admin/subcategories/:subcategoryId/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App