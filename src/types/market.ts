
// Types for the market data

export interface Order {
  price: number;
  volume: number;
}

export interface Trade {
  id: string;
  timestamp: string;
  price: number;
  size: number;
  side: "buy" | "sell";
  isMalicious?: boolean;
  anomalyScore?: number;
  flagReason?: string;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
  midPrice: number;
}

export type ManipulationPatternType = "spoofing" | "layering" | "wash" | "momentum_ignition";

export interface ManipulationPattern {
  timestamp: string;
  type: ManipulationPatternType;
  confidence: number;
  impact: "low" | "medium" | "high";
  details: Record<string, any>;
  orders: Array<{
    id: string;
    side: "buy" | "sell";
    price: number;
    volume: number;
    lifespan_ms: number;
  }>;
  trades: Trade[];
}

export interface DetectionAlert {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "critical";
  title: string;
  description: string;
  patternType?: ManipulationPatternType;
  relatedTrades?: Trade[];
}

export interface MarketMetrics {
  volatility: number;
  volume24h: number;
  priceChange24h: number;
  anomalyRate: number;
  manipulationScore: number;
}
