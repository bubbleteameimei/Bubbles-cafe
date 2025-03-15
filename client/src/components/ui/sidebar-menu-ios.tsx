import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  User, 
  HelpCircle, 
  Info, 
  MessageSquare, 
  FileText,
  Lock,
  Copyright,
  LogOut
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-ios-label-secondary mb-2 px-4">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  isNested?: boolean;
}

export function SidebarItem({ 
  icon, 
  label, 
  href, 
  isActive, 
  onClick,
  isNested = false
}: SidebarItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-4 py-2.5 text-base relative",
          isNested ? "pl-12" : "",
          isActive 
            ? "bg-ios-selection-dark text-ios-label-primary" 
            : "text-ios-label-primary hover:bg-ios-selection-dark/50"
        )}
        onClick={onClick}
      >
        <span className="flex items-center justify-center w-6 h-6 mr-3">
          {icon}
        </span>
        <span>{label}</span>
      </a>
    </Link>
  );
}

export function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <button
      onClick={logout}
      className="flex items-center px-4 py-2.5 text-base w-full text-ios-red hover:bg-ios-selection-dark/50"
    >
      <span className="flex items-center justify-center w-6 h-6 mr-3">
        <LogOut className="w-5 h-5" />
      </span>
      <span>Sign Out</span>
    </button>
  );
}

export default function IOSSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['support']);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const isSectionExpanded = (section: string) => expandedSections.includes(section);

  return (
    <div className="ios-sidebar flex flex-col h-full bg-ios-background-dark text-ios-label-primary overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarSection title="Navigation">
          <SidebarItem 
            icon={<Home className="w-5 h-5" />} 
            label="Home" 
            href="/" 
            isActive={location === '/'} 
          />
          <SidebarItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Index" 
            href="/index" 
            isActive={location === '/index'} 
          />
          <SidebarItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Reader" 
            href="/reader" 
            isActive={location === '/reader'} 
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Community" 
            href="/community" 
            isActive={location === '/community'} 
          />
        </SidebarSection>

        <SidebarSection title="Display Settings">
          <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Display Settings" 
            href="/settings/display" 
            isActive={location === '/settings/display'} 
          />
        </SidebarSection>

        <SidebarSection title="Account Settings">
          <SidebarItem 
            icon={<User className="w-5 h-5" />} 
            label="Account Settings" 
            href="/settings/account" 
            isActive={location === '/settings/account'} 
          />
        </SidebarSection>

        <SidebarSection title="Support & Legal">
          <div
            className="flex items-center px-4 py-2.5 text-base cursor-pointer"
            onClick={() => toggleSection('support')}
          >
            <span className="flex items-center justify-center w-6 h-6 mr-3">
              <HelpCircle className="w-5 h-5" />
            </span>
            <span>Support & Legal</span>
          </div>

          {isSectionExpanded('support') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <SidebarItem 
                icon={<Info className="w-5 h-5" />} 
                label="About Us" 
                href="/about" 
                isActive={location === '/about'} 
                isNested
              />
              <SidebarItem 
                icon={<MessageSquare className="w-5 h-5" />} 
                label="Contact Support" 
                href="/contact" 
                isActive={location === '/contact'} 
                isNested
              />
              <SidebarItem 
                icon={<MessageSquare className="w-5 h-5" />} 
                label="Feedback & Suggestions" 
                href="/feedback" 
                isActive={location === '/feedback'} 
                isNested
              />
              <SidebarItem 
                icon={<FileText className="w-5 h-5" />} 
                label="Terms of Service" 
                href="/terms" 
                isActive={location === '/terms'} 
                isNested
              />
              <SidebarItem 
                icon={<Lock className="w-5 h-5" />} 
                label="Privacy Policy" 
                href="/privacy" 
                isActive={location === '/privacy'} 
                isNested
              />
              <SidebarItem 
                icon={<Copyright className="w-5 h-5" />} 
                label="Copyright Policy" 
                href="/copyright" 
                isActive={location === '/copyright'} 
                isNested
              />
            </motion.div>
          )}
        </SidebarSection>
      </div>

      {user && (
        <div className="mt-auto border-t border-ios-separator-dark pt-2 pb-4">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}