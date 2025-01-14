import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calculator, History, BarChart2, GitCompare } from 'lucide-react';

function Navigation() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-blue-50'
    }`;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-blue-600">SimFin</h1>
          <div className="flex gap-4">
            <NavLink to="/" className={linkClass}>
              <Calculator size={20} />
              <span>SAC</span>
            </NavLink>
            <NavLink to="/price" className={linkClass}>
              <BarChart2 size={20} />
              <span>Price</span>
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              <History size={20} />
              <span>Simulações Salvas</span>
            </NavLink>
            <NavLink to="/comparison" className={linkClass}>
              <GitCompare size={20} />
              <span>Comparação</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;