import React from 'react';
import { Code, Settings, BarChart3, CreditCard } from 'lucide-react';

export function PlaceholderPage({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      <div className="text-center py-20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center mx-auto mb-6">
          <Icon className="w-12 h-12 text-[#F5F5DC]" />
        </div>
        <h1 className="text-4xl font-bold text-[#F5F5DC] mb-3">{title}</h1>
        <p className="text-[#FFDAB9]/70 text-lg">{description}</p>
      </div>
    </div>
  );
}

export function WidgetSettings() {
  return <PlaceholderPage icon={Code} title="Widget Settings" description="Customize your character widgets" />;
}

export function Analytics() {
  return <PlaceholderPage icon={BarChart3} title="Analytics" description="View your character performance metrics" />;
}

export function Billing() {
  return <PlaceholderPage icon={CreditCard} title="Billing" description="Manage your subscription and payments" />;
}

export function SettingsPage() {
  return <PlaceholderPage icon={Settings} title="Settings" description="Configure your account preferences" />;
}
