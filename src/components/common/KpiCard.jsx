import React from 'react';

const KpiCard = ({ title = "KPI Title", value = "123", icon = null, color = "bg-sky-100 dark:bg-sky-900", textColor = "text-sky-600 dark:text-sky-400" }) => (
  <div className={`flex items-center p-6 rounded-xl shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors duration-300`}>
    {icon && (
      <div className={`mr-4 flex items-center justify-center w-12 h-12 rounded-full ${color}`}>
        {icon}
      </div>
    )}
    <div>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      <div className="text-slate-500 dark:text-slate-300">{title}</div>
    </div>
  </div>
);

export default KpiCard;
