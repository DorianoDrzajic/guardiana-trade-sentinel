
// Utility functions for market data simulation and analysis

// Generate a simulated order book
export const generateOrderBook = (
  basePrice: number = 100,
  depth: number = 10,
  spread: number = 0.05,
  volumeScale: number = 100
) => {
  const bids: Array<{ price: number; volume: number }> = [];
  const asks: Array<{ price: number; volume: number }> = [];

  // Generate bids (buy orders)
  for (let i = 0; i < depth; i++) {
    const priceDecrement = spread * (i + 1);
    const bidPrice = Number((basePrice - priceDecrement).toFixed(2));
    const volume = Math.round(volumeScale * (1 + Math.random()));
    bids.push({ price: bidPrice, volume });
  }

  // Generate asks (sell orders)
  for (let i = 0; i < depth; i++) {
    const priceIncrement = spread * (i + 1);
    const askPrice = Number((basePrice + priceIncrement).toFixed(2));
    const volume = Math.round(volumeScale * (1 + Math.random()));
    asks.push({ price: askPrice, volume });
  }

  // Sort bids in descending order (highest bid first)
  bids.sort((a, b) => b.price - a.price);
  // Sort asks in ascending order (lowest ask first)
  asks.sort((a, b) => a.price - b.price);

  return { bids, asks, midPrice: basePrice };
};

// Generate trades from a simulated order book
export const generateTrades = (
  orderBook: ReturnType<typeof generateOrderBook>,
  count: number = 20
) => {
  const { bids, asks, midPrice } = orderBook;
  const trades = [];

  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.5;
    let price, size;

    if (isBuy) {
      // Buy trade - use an ask price
      const askIndex = Math.floor(Math.random() * Math.min(3, asks.length));
      price = asks[askIndex].price;
      size = Math.round(asks[askIndex].volume * (0.1 + Math.random() * 0.4));
    } else {
      // Sell trade - use a bid price
      const bidIndex = Math.floor(Math.random() * Math.min(3, bids.length));
      price = bids[bidIndex].price;
      size = Math.round(bids[bidIndex].volume * (0.1 + Math.random() * 0.4));
    }

    trades.push({
      id: `trade-${Date.now()}-${i}`,
      timestamp: new Date().toISOString(),
      price: Number(price.toFixed(2)),
      size,
      side: isBuy ? "buy" : "sell",
      isMalicious: false,
    });
  }

  return trades;
};

// Generate manipulative patterns
export const generateManipulativePattern = (
  orderBook: ReturnType<typeof generateOrderBook>,
  type: "spoofing" | "layering" | "wash" | "momentum_ignition"
) => {
  const { bids, asks, midPrice } = orderBook;
  const manipulationData: Record<string, any> = {
    timestamp: new Date().toISOString(),
    type,
    confidence: 0.75 + Math.random() * 0.2,
    impact: type === "wash" ? "medium" : "high",
    details: {},
    orders: [],
    trades: []
  };

  switch (type) {
    case "spoofing": {
      // Spoofing: place large orders far from mid price with no intention to execute
      const spoof_side = Math.random() > 0.5 ? "buy" : "sell";
      const price = spoof_side === "buy" 
        ? midPrice * (0.95 - Math.random() * 0.03) 
        : midPrice * (1.05 + Math.random() * 0.03);
      
      manipulationData.details = {
        description: "Large order placed far from midpoint, likely to be canceled",
        side: spoof_side,
        cancelProbability: 0.95
      };
      
      manipulationData.orders.push({
        id: `spoof-${Date.now()}`,
        side: spoof_side,
        price: Number(price.toFixed(2)),
        volume: Math.round(1000 + Math.random() * 9000),
        lifespan_ms: Math.round(500 + Math.random() * 2000)
      });
      break;
    }
      
    case "layering": {
      // Layering: multiple orders at different price levels to create false impression
      const layer_side = Math.random() > 0.5 ? "buy" : "sell";
      const base_adjustment = layer_side === "buy" ? 0.97 : 1.03;
      
      manipulationData.details = {
        description: "Multiple orders at different price levels on one side of the book",
        side: layer_side,
        layers: 4
      };
      
      for (let i = 0; i < 4; i++) {
        const adjustment = layer_side === "buy" 
          ? base_adjustment - (i * 0.005)
          : base_adjustment + (i * 0.005);
        
        manipulationData.orders.push({
          id: `layer-${Date.now()}-${i}`,
          side: layer_side,
          price: Number((midPrice * adjustment).toFixed(2)),
          volume: Math.round(500 + Math.random() * 1500),
          lifespan_ms: Math.round(800 + Math.random() * 1500)
        });
      }
      break;
    }
      
    case "wash": {
      // Wash trading: trader buying and selling the same asset to create false activity
      const basePrice = midPrice;
      
      manipulationData.details = {
        description: "Same entity trading with itself to create false impression of market activity",
        entity_id: `entity-${Math.floor(Math.random() * 1000)}`
      };
      
      // Generate a series of wash trades
      for (let i = 0; i < 5; i++) {
        const priceVariation = basePrice * (0.999 + Math.random() * 0.002);
        const volume = Math.round(100 + Math.random() * 300);
        
        manipulationData.trades.push(
          {
            id: `wash-buy-${Date.now()}-${i}`,
            timestamp: new Date().toISOString(),
            price: Number(priceVariation.toFixed(2)),
            size: volume,
            side: "buy",
            entity: manipulationData.details.entity_id,
            isMalicious: true
          },
          {
            id: `wash-sell-${Date.now()}-${i}`,
            timestamp: new Date(Date.now() + 100).toISOString(),
            price: Number(priceVariation.toFixed(2)),
            size: volume,
            side: "sell",
            entity: manipulationData.details.entity_id,
            isMalicious: true
          }
        );
      }
      break;
    }
      
    case "momentum_ignition": {
      // Momentum ignition: enter aggressive orders to trigger stops or algorithms
      const ignition_side = Math.random() > 0.5 ? "buy" : "sell";
      const aggressivePrice = ignition_side === "buy"
        ? asks[0].price * 1.003
        : bids[0].price * 0.997;
        
      manipulationData.details = {
        description: "Aggressive orders to trigger price momentum and algorithm responses",
        side: ignition_side,
        target: "stop orders and algorithms"
      };
      
      for (let i = 0; i < 3; i++) {
        const timeOffset = i * 200; // 200ms between orders
        
        manipulationData.trades.push({
          id: `momentum-${Date.now()}-${i}`,
          timestamp: new Date(Date.now() + timeOffset).toISOString(),
          price: Number(aggressivePrice.toFixed(2)),
          size: Math.round(300 + Math.random() * 700),
          side: ignition_side,
          isMalicious: true
        });
      }
      break;
    }
  }

  return manipulationData;
};

// Simulate detection of anomalies using isolation forest logic
export const detectAnomalies = (trades: any[], threshold = 0.8) => {
  // This is a simplified simulation of anomaly detection
  // In a real implementation, this would use actual isolation forest or similar algorithms
  
  const anomalies = trades
    .filter(trade => {
      // Randomly flag some trades as anomalies if they have high volume
      // In a real implementation this would use features like:
      // - Price deviation from VWAP
      // - Unusual timing
      // - Abnormal volume
      // - Order book imbalance
      const randomScore = Math.random();
      const isHighVolume = trade.size > 400;
      
      // Assign anomaly score
      trade.anomalyScore = isHighVolume ? 0.6 + randomScore * 0.4 : randomScore * 0.5;
      
      return trade.anomalyScore > threshold || trade.isMalicious;
    })
    .map(trade => ({
      ...trade,
      flagReason: trade.isMalicious 
        ? "Known manipulation pattern" 
        : "Abnormal trading pattern detected"
    }));
    
  return anomalies;
};
