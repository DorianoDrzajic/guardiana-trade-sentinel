import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import OrderBookVisualizer from '@/components/OrderBookVisualizer';
import TradeFlow from '@/components/TradeFlow';
import DetectionAlerts from '@/components/DetectionAlerts';
import MarketMetricsCard from '@/components/MarketMetricsCard';
import PatternVisualizer from '@/components/PatternVisualizer';
import { Trade, DetectionAlert, ManipulationPattern, MarketMetrics } from '@/types/market';
import { 
  generateOrderBook, 
  generateTrades, 
  generateManipulativePattern,
  detectAnomalies
} from '@/utils/marketUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [orderBook, setOrderBook] = useState(generateOrderBook());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [alerts, setAlerts] = useState<DetectionAlert[]>([]);
  const [manipulationPattern, setManipulationPattern] = useState<ManipulationPattern | undefined>();
  const [historicalPrices, setHistoricalPrices] = useState<Array<{ timestamp: string; price: number }>>([]);
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics>({
    volatility: 0.015,
    volume24h: 128750,
    priceChange24h: 0.0245,
    anomalyRate: 0.05,
    manipulationScore: 18
  });
  const [highlightedOrders, setHighlightedOrders] = useState<Array<{price: number; side: 'bid' | 'ask'}>>([]);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  
  const { toast } = useToast();
  
  useEffect(() => {
    const initialTrades = generateTrades(orderBook, 15);
    setTrades(initialTrades);
    
    const initialPrices = [];
    const now = Date.now();
    const basePrice = orderBook.midPrice;
    
    for (let i = 20; i >= 0; i--) {
      initialPrices.push({
        timestamp: new Date(now - i * 60000).toISOString(),
        price: basePrice + (Math.random() - 0.5) * 1.5
      });
    }
    
    setHistoricalPrices(initialPrices);
    
    const manipulationInterval = setInterval(() => {
      triggerManipulationPattern();
    }, 30000);
    
    return () => {
      clearInterval(manipulationInterval);
    };
  }, []);
  
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const newOrderBook = generateOrderBook(
        orderBook.midPrice * (1 + (Math.random() - 0.5) * 0.001)
      );
      setOrderBook(newOrderBook);
      
      const newTrades = generateTrades(newOrderBook, 2)
        .map((trade) => ({ ...trade, timestamp: new Date().toISOString() }));
      
      setTrades((prevTrades) => [...newTrades, ...prevTrades].slice(0, 25));
      
      const newPrice = {
        timestamp: new Date().toISOString(),
        price: newOrderBook.midPrice
      };
      
      setHistoricalPrices((prevPrices) => {
        const updatedPrices = [...prevPrices, newPrice];
        return updatedPrices.slice(-30);
      });
      
      const anomalies = detectAnomalies(newTrades, 0.7);
      if (anomalies.length > 0) {
        const lastTradeId = newTrades[0].id;
        const alert: DetectionAlert = {
          id: `alert-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: anomalies[0].anomalyScore && anomalies[0].anomalyScore > 0.85 ? 'warning' : 'info',
          title: 'Unusual Trading Activity Detected',
          description: `Anomalous trade patterns identified with confidence score of ${anomalies[0].anomalyScore?.toFixed(2)}`,
          relatedTrades: anomalies
        };
        
        setAlerts((prevAlerts) => [alert, ...prevAlerts].slice(0, 10));
        
        if (anomalies[0].anomalyScore && anomalies[0].anomalyScore > 0.85) {
          toast({
            title: "Anomaly Detected",
            description: "Unusual trading pattern has been flagged",
            variant: "destructive"
          });
        }
      }
    }, 5000);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [orderBook, toast]);
  
  const triggerManipulationPattern = () => {
    const patternTypes = ["spoofing", "layering", "wash", "momentum_ignition"] as const;
    const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    const pattern = generateManipulativePattern(orderBook, randomPattern);
    setManipulationPattern(pattern);
    
    const newManipulationScore = Math.min(100, marketMetrics.manipulationScore + 15 + Math.random() * 20);
    
    setMarketMetrics({
      ...marketMetrics,
      manipulationScore: newManipulationScore,
      anomalyRate: Math.min(0.25, marketMetrics.anomalyRate + 0.05)
    });
    
    const alert: DetectionAlert = {
      id: `pattern-alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'critical',
      title: `Potential ${randomPattern.replace('_', ' ')} detected`,
      description: pattern.details.description || `Market ${randomPattern.replace('_', ' ')} pattern identified with ${(pattern.confidence * 100).toFixed(0)}% confidence`,
      patternType: randomPattern,
      relatedTrades: pattern.trades
    };
    
    setAlerts((prevAlerts) => [alert, ...prevAlerts].slice(0, 10));
    
    if (newManipulationScore > 70) {
      setRiskLevel("high");
    } else if (newManipulationScore > 40) {
      setRiskLevel("medium");
    }
    
    if (pattern.orders && pattern.orders.length > 0) {
      const highlighted = pattern.orders.map(order => ({
        price: order.price,
        side: order.side === "buy" ? "bid" : "ask"
      }));
      
      setHighlightedOrders(highlighted);
      
      setTimeout(() => {
        setHighlightedOrders([]);
      }, 8000);
    }
    
    toast({
      title: "Market Manipulation Alert",
      description: `Potential ${randomPattern.replace('_', ' ')} pattern detected`,
      variant: "destructive"
    });
    
    if (pattern.trades && pattern.trades.length > 0) {
      setTrades((prevTrades) => [...pattern.trades, ...prevTrades].slice(0, 25));
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Header 
        title="Guardiana Trade Sentinel" 
        alertsCount={alerts.filter(a => a.level === 'critical' || a.level === 'warning').length}
        riskLevel={riskLevel}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <MarketMetricsCard 
            metrics={marketMetrics}
            historicalPrices={historicalPrices}
          />
        </div>
        <div>
          <PatternVisualizer 
            pattern={manipulationPattern}
          />
        </div>
      </div>
      
      <Tabs defaultValue="market" className="w-full">
        <TabsList>
          <TabsTrigger value="market">Market View</TabsTrigger>
          <TabsTrigger value="detection">Anomaly Detection</TabsTrigger>
        </TabsList>
        <TabsContent value="market">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OrderBookVisualizer 
              orderBook={orderBook} 
              highlightedOrders={highlightedOrders}
            />
            <TradeFlow 
              trades={trades} 
              title="Live Trade Feed"
            />
          </div>
        </TabsContent>
        <TabsContent value="detection">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetectionAlerts alerts={alerts} />
            <div className="grid grid-cols-1 gap-4">
              <Card className="w-full pattern-grid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Common Manipulation Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {['spoofing', 'layering', 'wash trading', 'momentum ignition'].map((pattern) => (
                      <div 
                        key={pattern}
                        className="p-3 rounded-md border border-border bg-card/80"
                      >
                        <h3 className="font-medium text-sm mb-1">{pattern}</h3>
                        <p className="text-xs text-muted-foreground">
                          {pattern === 'spoofing' && 'Placing large orders with no intention to execute'}
                          {pattern === 'layering' && 'Multiple orders at different prices to create false depth'}
                          {pattern === 'wash trading' && 'Self-trading to create illusion of market activity'}
                          {pattern === 'momentum ignition' && 'Triggering stops by aggressive orders'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
