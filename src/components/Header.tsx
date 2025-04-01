
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, BarChart3, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  alertsCount?: number;
  riskLevel?: "low" | "medium" | "high";
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "Market Manipulation Detection",
  alertsCount = 0,
  riskLevel = "low",
  className
}) => {
  const getRiskColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-market-anomaly text-primary-foreground";
      case "low": return "bg-market-bid text-primary-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className={cn("flex items-center justify-between pb-4", className)}>
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <Badge 
          className={cn(
            "ml-2", 
            getRiskColor(riskLevel)
          )}
        >
          {riskLevel === "high" ? "High Risk" : 
           riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        
        {alertsCount > 0 ? (
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {alertsCount}
            </span>
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
