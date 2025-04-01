
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, ReferenceLine, TooltipProps 
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderBook, Order } from '@/types/market';

interface OrderBookVisualizerProps {
  orderBook: OrderBook;
  highlightedOrders?: Array<{price: number; side: 'bid' | 'ask'}>;
  title?: string;
  height?: number;
}

const OrderBookVisualizer: React.FC<OrderBookVisualizerProps> = ({
  orderBook,
  highlightedOrders = [],
  title = 'Order Book Visualization',
  height = 300
}) => {
  const { bids, asks, midPrice } = orderBook;
  
  // Prepare data for visualization
  const bidData = bids.map(bid => ({
    price: bid.price,
    volume: bid.volume,
    type: 'bid'
  }));
  
  const askData = asks.map(ask => ({
    price: ask.price,
    volume: -ask.volume, // Negative for visual distinction
    type: 'ask'
  }));
  
  const allData = [...bidData, ...askData].sort((a, b) => a.price - b.price);
  
  // Function to check if an order is highlighted
  const isHighlighted = (price: number, side: 'bid' | 'ask') => {
    return highlightedOrders.some(
      order => Math.abs(order.price - price) < 0.01 && order.side === side
    );
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const side = data.volume > 0 ? 'Bid' : 'Ask';
    const volume = Math.abs(data.volume);
    
    return (
      <div className="chart-tooltip">
        <p className="mb-1 font-semibold">{side} Order</p>
        <p className="text-sm">Price: ${data.price.toFixed(2)}</p>
        <p className="text-sm">Volume: {volume}</p>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={allData}
            margin={{ top: 5, right: 20, left: 20, bottom: 25 }}
            barGap={0}
            layout="horizontal"
            barCategoryGap={1}
          >
            <XAxis 
              dataKey="price" 
              type="number"
              domain={['dataMin', 'dataMax']} 
              tickFormatter={(value) => value.toFixed(1)}
              tick={{ fontSize: 12, fill: '#a3b1cc' }}
            />
            <YAxis
              tickFormatter={(value) => Math.abs(value).toString()}
              tick={{ fontSize: 12, fill: '#a3b1cc' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={midPrice} stroke="#6b7280" strokeDasharray="3 3" />
            <Bar dataKey="volume" name="Volume">
              {allData.map((entry, index) => {
                const isOrderHighlighted = isHighlighted(
                  entry.price, 
                  entry.volume > 0 ? 'bid' : 'ask'
                );
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isOrderHighlighted
                        ? '#ffca28'
                        : entry.volume > 0
                          ? '#4caf50'
                          : '#ff5252'
                    }
                    className={
                      isOrderHighlighted ? 'animate-pulse-warning' : undefined
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OrderBookVisualizer;
