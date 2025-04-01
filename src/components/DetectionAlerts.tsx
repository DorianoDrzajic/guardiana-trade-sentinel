
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, ShieldAlert, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetectionAlert } from '@/types/market';

interface DetectionAlertsProps {
  alerts: DetectionAlert[];
  maxHeight?: number;
}

const DetectionAlerts: React.FC<DetectionAlertsProps> = ({
  alerts,
  maxHeight = 400
}) => {
  const getAlertIcon = (level: DetectionAlert['level']) => {
    switch (level) {
      case 'critical':
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-market-anomaly" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-market-neutral" />;
    }
  };

  const getAlertClassName = (level: DetectionAlert['level']) => {
    switch (level) {
      case 'critical':
        return "border-destructive/50 animate-pulse-warning";
      case 'warning':
        return "border-market-anomaly/50";
      case 'info':
      default:
        return "border-market-neutral/50";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Detection Alerts</CardTitle>
          <Shield className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`max-h-[${maxHeight}px] pr-4`}>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Alert 
                  key={alert.id}
                  className={cn("border", getAlertClassName(alert.level))}
                >
                  <div className="flex items-start">
                    {getAlertIcon(alert.level)}
                    <div className="ml-3 w-full">
                      <div className="flex items-center justify-between">
                        <AlertTitle className="text-sm font-medium">
                          {alert.title}
                        </AlertTitle>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <AlertDescription className="text-xs mt-1">
                        {alert.description}
                      </AlertDescription>
                      {alert.patternType && (
                        <div className="mt-2">
                          <span className="text-xs font-medium inline-block rounded px-2 py-0.5 bg-secondary">
                            {alert.patternType.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No alerts detected
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DetectionAlerts;
