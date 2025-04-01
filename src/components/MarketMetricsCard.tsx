
import React from 'react';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, TooltipProps, Legend
} from 'recharts';
import { Separator } from '@/components/ui/separator';
import { MarketMetrics } from '@/types/market';

interface MarketMetricsCardProps {
  metrics: MarketMetrics;
  historicalPrices: Array<{ timestamp: string; price: number }>;
}

const MarketMetricsCard: React.FC<MarketMetricsCardProps> = ({
  metrics,
  historicalPrices
}) => {
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="chart-tooltip">
        <p className="mb-1 font-semibold">
          {new Date(label).toLocaleTimeString()}
        </p>
        <p className="text-sm">Price: ${payload[0].value?.toFixed(2)}</p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Market Metrics</CardTitle>
        <CardDescription>Key indicators and market health</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalPrices}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(tickItem) => new Date(tickItem).toLocaleTimeString()} 
                tick={{ fontSize: 12, fill: '#a3b1cc' }}
                minTickGap={80}
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                tickCount={5}
                tick={{ fontSize: 12, fill: '#a3b1cc' }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2196f3" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Volatility (24h)</p>
            <p className="font-medium">{(metrics.volatility * 100).toFixed(2)}%</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Volume (24h)</p>
            <p className="font-medium">{metrics.volume24h.toLocaleString()}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Price Change (24h)</p>
            <p className={`font-medium ${
              metrics.priceChange24h > 0 ? "text-market-bid" : "text-market-ask"
            }`}>
              {metrics.priceChange24h > 0 ? "+" : ""}
              {(metrics.priceChange24h * 100).toFixed(2)}%
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Manipulation Score</p>
            <p className={`font-medium ${
              metrics.manipulationScore > 70 ? "text-market-manipulation" : 
              metrics.manipulationScore > 30 ? "text-market-anomaly" : 
              "text-market-neutral"
            }`}>
              {metrics.manipulationScore.toFixed(0)}/100
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketMetricsCard;
