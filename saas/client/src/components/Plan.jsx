import { PricingTable } from '@clerk/clerk-react';
import React from 'react';

const Plan = () => {
  return (
    <div className="max-w-2xl mx-auto my-8 z-20 px-4">
      <div className="text-center mb-6">
        <h2 className="text-xl text-gray-800 font-normal">Choose Your Plan</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
        </p>
      </div>
      <div>
        <PricingTable />
      </div>
    </div>
  );
};

export default Plan;
