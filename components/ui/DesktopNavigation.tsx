'use client';

import React, { ReactNode } from 'react';

// 네비게이션 아이템 타입
interface NavItem {
  icon: string;
  label: string;
  href: string;
  description?: string;
  active?: boolean;
}

// 사이드바 네비게이션
interface SidebarNavProps {
  items: NavItem[];
  currentPage?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function SidebarNav({ items, currentPage, collapsed = false, onToggle }: SidebarNavProps) {
  return (
    <aside className={`
      fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40
      ${collapsed ? 'w-16' : 'w-64'}
      border-r border-gray-200
    `}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <h2 className="font-bold text-lg text-gray-800">メニュー</h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg">
            {collapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* 네비게이션 아이템들 */}
      <nav className="p-2">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`
              flex items-center p-3 rounded-lg mb-1 transition-all duration-200
              hover:bg-purple-50 hover:text-purple-600 group
              ${currentPage === item.href 
                ? 'bg-purple-100 text-purple-700 shadow-sm' 
                : 'text-gray-700 hover:text-purple-600'
              }
            `}
          >
            <span className="text-xl mr-3 flex-shrink-0">
              {item.icon}
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                )}
              </div>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
}

// 헤더 네비게이션 (태블릿용)
interface HeaderNavProps {
  items: NavItem[];
  currentPage?: string;
}

export function HeaderNav({ items, currentPage }: HeaderNavProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <span className="text-2xl mr-2">🍽️</span>
            <h1 className="font-bold text-lg text-gray-800">
              今日何食べよう？
            </h1>
          </div>

          {/* 네비게이션 */}
          <nav className="flex space-x-1">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${currentPage === item.href
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// 퀵 액션 버튼들
interface QuickAction {
  icon: string;
  label: string;
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  collapsed?: boolean;
}

export function QuickActions({ actions, collapsed = false }: QuickActionsProps) {
  return (
    <div className={`
      fixed bottom-4 left-4 space-y-2 z-30 transition-all duration-300
      ${collapsed ? 'ml-0' : 'ml-60'}
    `}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`
            flex items-center bg-purple-600 text-white rounded-lg shadow-lg
            hover:bg-purple-700 transition-all duration-200
            hover:scale-105 active:scale-95
            ${collapsed ? 'p-3' : 'px-4 py-3'}
          `}
        >
          <span className="text-lg">{action.icon}</span>
          {!collapsed && (
            <span className="ml-2 font-medium text-sm">
              {action.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// 브레드크럼
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400">/</span>
          )}
          {item.href ? (
            <a 
              href={item.href}
              className="hover:text-purple-600 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-800 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// 검색 바
interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ 
  placeholder = "レストランや料理を検索...", 
  onSearch,
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-purple-500 focus:border-transparent
          transition-all duration-200
        "
      />
      <div className="absolute left-3 top-2.5">
        <span className="text-gray-400">🔍</span>
      </div>
      <button
        type="submit"
        className="
          absolute right-2 top-1.5 px-3 py-1 
          bg-purple-600 text-white text-sm rounded-md
          hover:bg-purple-700 transition-colors
        "
      >
        検索
      </button>
    </form>
  );
} 