import { Link } from 'react-router-dom';


<aside class="w-64 bg-white shadow-md flex flex-col">
    <div class="p-6 text-center border-b">
        <i class="fas fa-sitemap text-3xl text-sky-600"></i>
        <h1 class="text-2xl font-bold text-slate-800 mt-2">HRM</h1>
    </div>
    <nav class="flex-1 px-4 py-6 space-y-2">
        <Link to="/" className="nav-link ...">
            <i className="sidebar-icon fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
        </Link>
        <Link to="/employees" className="nav-link ...">
            <i className="sidebar-icon fas fa-users"></i>
            <span>Employees</span>
        </Link>
        <a href="#" class="nav-link flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100 active" onclick="showPage('dashboard')">
            <i class="sidebar-icon fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
        </a>
        <a href="#" class="nav-link flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100" onclick="showPage('employees')">
            <i class="sidebar-icon fas fa-users"></i>
            <span>Employees</span>
        </a>
        <a href="#" class="nav-link flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100" onclick="showPage('leave')">
            <i class="sidebar-icon fas fa-calendar-alt"></i>
            <span>Leave Mgt.</span>
        </a>
        <a href="#" class="nav-link flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100" onclick="showPage('reports')">
            <i class="sidebar-icon fas fa-chart-pie"></i>
            <span>Reports</span>
        </a>
        <a href="#" class="nav-link flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100">
            <i class="sidebar-icon fas fa-cog"></i>
            <span>Settings</span>
        </a>
    </nav>
    <div class="px-4 py-6 border-t">
        <a href="#" class="nav-link flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100" onclick="logout()">
                <i class="sidebar-icon fas fa-sign-out-alt"></i>
                <span>Logout</span>
        </a>
    </div>
</aside>