import React from 'react';
import { motion } from 'framer-motion';
import KpiCard from '../components/common/KpiCard';

const DashboardPage = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <KpiCard title="Total Employees" value="120" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <KpiCard
          title="On Leave"
          value="8"
          color="bg-yellow-100"
          textColor="text-yellow-600"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <KpiCard
          title="Active Projects"
          value="5"
          color="bg-green-100"
          textColor="text-green-600"
        />
      </motion.div>
    </div>
  </div>
);

export default DashboardPage;