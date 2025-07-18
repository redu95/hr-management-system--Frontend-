"use client"
import { motion } from "framer-motion"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { FaUsers, FaUserMinus, FaInbox, FaUserPlus } from "react-icons/fa"
import useAuthStore from "../store/authStore"
import RoleBasedComponent from "../components/common/RoleBasedComponent"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const HeadcountChart = () => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "#e2e8f0" },
                ticks: { color: "#64748b" },
            },
            x: {
                grid: { display: false },
                ticks: { color: "#64748b" },
            },
        },
    }

    const data = {
        labels: ["Marketing", "Finance", "Technology", "Customer Support", "Sales"],
        datasets: [
            {
                label: "Headcount",
                data: [45, 30, 85, 60, 55],
                backgroundColor: "rgba(14, 165, 233, 0.6)",
                borderColor: "rgba(14, 165, 233, 1)",
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    }

    return (
        <div className="h-full bg-white dark:bg-slate-800 rounded-xl transition-colors duration-300 p-2">
            <Bar options={options} data={data} />
        </div>
    )
}

const RecentHiresList = () => {
    const hires = [
        { name: "Minase Lemma", title: "CTO(Chief Technology Officer)", avatar: "M" },
        { name: "Naol Lemma", title: "CEO(Chief Executive Officer)", avatar: "N" },
        { name: "Eleni Lemma", title: "HR (Human Resource)", avatar: "E" },
        { name: "Yididya Lemma", title: "Frontend Developer", avatar: "Y" },
    ]

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Hires</h3>
            <ul className="mt-4 space-y-4">
                {hires.map((hire, index) => (
                    <li key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-100 flex items-center justify-center font-bold">
                            {hire.avatar}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-100">{hire.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-300">{hire.title}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const KpiCard = ({ icon: Icon, title, value, color, index }) => {
    const colors = {
        sky: "text-sky-500 bg-sky-100 dark:bg-sky-900",
        amber: "text-amber-500 bg-amber-100 dark:bg-amber-900",
        rose: "text-rose-500 bg-rose-100 dark:bg-rose-900",
        green: "text-green-500 bg-green-100 dark:bg-green-900",
    }

    return (
        <motion.div
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Icon className={`text-2xl p-3 rounded-full ${colors[color]} w-12 h-12`} />
            <p className="text-3xl font-bold mt-4 text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-slate-500 dark:text-slate-300">{title}</p>
        </motion.div>
    )
}

const DashboardPage = () => {
    const { user } = useAuthStore()

    const kpiData = [
        { icon: FaUsers, title: "Total Employees", value: "248", color: "sky" },
        { icon: FaUserMinus, title: "Employees on Leave", value: "12", color: "amber" },
        { icon: FaInbox, title: "Pending Requests", value: "5", color: "rose" },
        { icon: FaUserPlus, title: "New Hires (Month)", value: "8", color: "green" },
    ]

    // Filter KPIs based on user role
    const getFilteredKPIs = () => {
        if (user?.role === "Employee") {
            return [
                { icon: FaUsers, title: "My Team Size", value: "12", color: "sky" },
                { icon: FaUserMinus, title: "My Leave Days Used", value: "8", color: "amber" },
                { icon: FaInbox, title: "My Pending Requests", value: "2", color: "rose" },
                { icon: FaUserPlus, title: "Days Until Next Review", value: "45", color: "green" },
            ]
        }
        return kpiData
    }

    return (
        <div className="p-4 sm:p-8">
            {/* Welcome Message */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome back, {user?.username}!</h1>
                <p className="text-slate-600 dark:text-slate-300">Here's what's happening in your organization today.</p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getFilteredKPIs().map((item, index) => (
                    <KpiCard
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        value={item.value}
                        color={item.color}
                        index={index}
                    />
                ))}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Chart - Only show to non-employees */}
                <RoleBasedComponent
                    allowedRoles={["CEO", "Manager", "HR"]}
                    fallback={
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">My Performance</h3>
                            <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                <p>Performance metrics will be displayed here</p>
                            </div>
                        </div>
                    }
                >
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Headcount by Department</h3>
                        <div className="h-80 mt-4">
                            <HeadcountChart />
                        </div>
                    </div>
                </RoleBasedComponent>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <RoleBasedComponent
                        allowedRoles={["CEO", "Manager", "HR"]}
                        fallback={
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full transition-colors duration-300">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Recent Activity</h3>
                                <ul className="mt-4 space-y-4">
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">Leave request approved</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">Profile updated</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">Training completed</span>
                                    </li>
                                </ul>
                            </div>
                        }
                    >
                        <RecentHiresList />
                    </RoleBasedComponent>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
