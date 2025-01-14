import React from 'react';
import { GitCompare } from 'lucide-react';

function Comparison() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Comparação entre Sistemas</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <GitCompare size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            Realize simulações para comparar os sistemas de amortização.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Comparison;