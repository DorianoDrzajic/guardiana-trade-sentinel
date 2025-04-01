
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ManipulationPattern } from '@/types/market';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps
} from 'recharts';
import { cn } from '@/lib/utils';

interface PatternVisualizerProps {
  pattern?: ManipulationPattern;
  isLoading?: boolean;
}

const getPatternDisplayName = (type: string) => {
  switch (type) {
    case 'spoofing': return 'Spoofing';
    case 'layering': return 'Layering';
    case 'wash': return 'Wash Trading';
    case 'momentum_ignition': return 'Momentum Ignition';
    default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const getPatternDescription = (pattern: ManipulationPattern) => {
  switch (pattern.type) {
    case 'spoofing':
      return 'Large orders placed with no intention of execution to create false impression of market pressure.';
    case 'layering':
      return 'Multiple orders at different price levels to create artificial market depth.';
    case 'wash':
      return 'Trading activity between related parties with no change in beneficial ownership.';
    case 'momentum_ignition':
      return 'Entering orders to trigger price momentum and algorithm responses.';
    default:
      return pattern.details.description || 'Unknown pattern detected';
  }
};

const PatternVisualizer: React.FC<PatternVisualizerProps> = ({ 
  pattern, 
  isLoading = false 
}) => {
  // Handle loading or empty state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[250px]">
          <div className="text-center text-muted-foreground">Loading pattern data...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!pattern) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[250px]">
          <div className="text-center text-muted-foreground">No pattern detected</div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare visualization data based on pattern type
  let visualizationData: any[] = [];
  
  // Common tooltip for all visualization types
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="chart-tooltip">
        <p className="mb-1 font-semibold">{data.name || 'Event'}</p>
        <p className="text-sm">Price: ${data.price.toFixed(2)}</p>
        <p className="text-sm">Size: {data.volume || data.size}</p>
        {data.side && (
          <p className="text-sm">Side: {data.side}</p>
        )}
        {data.time && (
          <p className="text-sm">Time: {new Date(data.time).toLocaleTimeString()}</p>
        )}
      </div>
    );
  };
  
  // Prepare data based on pattern type
  if (pattern.type === 'spoofing' || pattern.type === 'layering') {
    // Use orders data for spoofing and layering
    visualizationData = pattern.orders.map((order, i) => ({
      id: i,
      price: order.price,
      volume: order.volume,
      side: order.side,
      name: `${order.side === 'buy' ? 'Bid' : 'Ask'} Order`,
      z: order.volume * 0.01, // For bubble size
    }));
  } else if (pattern.type === 'wash' || pattern.type === 'momentum_ignition') {
    // Use trades data for wash trading and momentum ignition
    visualizationData = pattern.trades.map((trade, i) => ({
      id: i,
      price: trade.price,
      size: trade.size,
      side: trade.side,
      time: trade.timestamp,
      name: `${trade.side === 'buy' ? 'Buy' : 'Sell'} Trade`,
      z: trade.size * 0.05, // For bubble size
    }));
  }
  
  // Get appropriate colors for this pattern type
  const getPatternColor = () => {
    switch (pattern.type) {
      case 'spoofing': return '#ff5252';
      case 'layering': return '#ff9800';
      case 'wash': return '#ff3d71';
      case 'momentum_ignition': return '#9c27b0';
      default: return '#ff5252';
    }
  };
  
  const patternColor = getPatternColor();
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pattern Analysis</CardTitle>
          <Badge 
            variant="outline" 
            className="bg-secondary/50"
          >
            {getPatternDisplayName(pattern.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-sm">
          <p>{getPatternDescription(pattern)}</p>
          <div className="flex justify-between mt-2 text-xs">
            <span>Confidence: <span className="font-medium">{(pattern.confidence * 100).toFixed(0)}%</span></span>
            <span>Impact: <span className={cn(
              "font-medium",
              pattern.impact === 'high' ? "text-market-manipulation" :
              pattern.impact === 'medium' ? "text-market-anomaly" :
              "text-market-neutral"
            )}>
              {pattern.impact.toUpperCase()}
            </span></span>
          </div>
        </div>
        
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                type="number" 
                dataKey="price"
                name="Price" 
                domain={['auto', 'auto']}
                tick={{ fontSize: 12, fill: '#a3b1cc' }}
              />
              <YAxis 
                type="number" 
                dataKey={visualizationData[0]?.volume ? 'volume' : 'size'}
                name="Size" 
                domain={[0, 'auto']}
                tick={{ fontSize: 12, fill: '#a3b1cc' }}
              />
              <ZAxis 
                type="number" 
                dataKey="z" 
                range={[50, 500]} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                name={pattern.type} 
                data={visualizationData} 
                fill={patternColor}
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternVisualizer;
