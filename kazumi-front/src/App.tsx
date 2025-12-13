import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Schedule from "./pages/Schedule";
import Content from "./pages/Content";
import Profile from "./pages/Profile";
import StudentDetails from "./pages/StudentDetails";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterSchool from "./pages/RegisterSchool";
import CreateActivity from "./pages/CreateActivity";
import Reports from "./pages/Reports";
import ClassManagement from "./pages/ClassManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mensagens" element={<Messages />} />
              <Route path="/agenda" element={<Schedule />} />
              <Route path="/conteudos" element={<Content />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/aluno" element={<StudentDetails />} />
              <Route path="/cadastrar-aluno" element={<RegisterStudent />} />
              <Route path="/cadastrar-escola" element={<RegisterSchool />} />
              <Route path="/criar-atividade" element={<CreateActivity />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/minhas-turmas" element={<ClassManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
