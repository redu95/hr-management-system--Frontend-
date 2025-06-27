import { Button } from 'primereact/button';

function LoginPage() {
  // Login function to handle login logic
  <div id="loginPage" class="page active">
        <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <i class="fas fa-sitemap text-4xl text-sky-600"></i>
                    <h1 class="text-3xl font-bold text-slate-800 mt-2">HR Management</h1>
                    <p class="text-slate-500">Welcome back! Please login to your account.</p>
                </div>
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    <div class="space-y-6">
                        <div>
                            <label for="email" class="text-sm font-medium text-slate-600">Email Address</label>
                            <input type="email" id="email" class="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="you@company.com" value="admin@company.com" />
                        </div>
                        <div>
                            <label for="password" class="text-sm font-medium text-slate-600">Password</label>
                            <input type="password" id="password" class="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" value="************" />
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-6">
                        <a href="#" class="text-sm text-sky-600 hover:underline">Forgot Password?</a>
                    </div>
                       <Button label="Login" className="w-full mt-6" /> 
                </div>
            </div>
        </div>
    </div>
  return (
    <div>
      <h2>Login Page</h2>
      <Button label="Login" />
    </div>
  );
}

export default LoginPage;
