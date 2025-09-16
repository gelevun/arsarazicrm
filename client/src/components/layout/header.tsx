import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  onAddClick?: () => void;
  addButtonText?: string;
}

export function Header({ 
  title, 
  onMenuClick, 
  onAddClick, 
  addButtonText = "Ekle" 
}: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuClick}
          data-testid="menu-button"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            data-testid="notifications-button"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
        </div>

        {/* Quick Actions */}
        {onAddClick && (
          <Button 
            onClick={onAddClick}
            size="sm"
            data-testid="quick-add-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{addButtonText}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
