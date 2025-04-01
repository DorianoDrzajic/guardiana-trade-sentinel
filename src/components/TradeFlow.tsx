
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trade } from '@/types/market';

interface TradeFlowProps {
  trades: Trade[];
  maxHeight?: number;
  title?: string;
}

const TradeFlow: React.FC<TradeFlowProps> = ({
  trades,
  maxHeight = 400,
  title = 'Recent Trades'
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className={cn(
                  "p-3 rounded-md border flex items-center justify-between",
                  trade.anomalyScore && trade.anomalyScore > 0.8
                    ? "border-market-manipulation bg-market-manipulation/10 animate-pulse-warning"
                    : trade.anomalyScore && trade.anomalyScore > 0.6
                    ? "border-market-anomaly bg-market-anomaly/10"
                    : "border-border"
                )}
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "font-medium",
                        trade.side === "buy" 
                          ? "bg-market-bid/20 text-market-bid border-market-bid" 
                          : "bg-market-ask/20 text-market-ask border-market-ask"
                      )}
                    >
                      {trade.side.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">${trade.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">{trade.size} units</span>
                  </div>
                  {trade.flagReason && (
                    <div className="mt-1 text-xs text-market-anomaly">
                      {trade.flagReason}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                  {trade.anomalyScore !== undefined && trade.anomalyScore > 0.5 && (
                    <div className="text-xs mt-1">
                      Score: <span className={cn(
                        trade.anomalyScore > 0.8 
                          ? "text-market-manipulation" 
                          : "text-market-anomaly"
                      )}>
                        {trade.anomalyScore.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TradeFlow;
