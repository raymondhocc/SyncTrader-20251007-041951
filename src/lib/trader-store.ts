import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
// --- TYPES ---
export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  pnl: number;
}
export interface Ticker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MKT' | 'LMT';
export type OrderStatus = 'Submitted' | 'Filled' | 'Cancelled';
export interface Order {
  id: number;
  symbol: string;
  quantity: number;
  side: OrderSide;
  type: OrderType;
  limitPrice?: number;
  status: OrderStatus;
  timestamp: number;
}
// --- STORE STATE & ACTIONS ---
interface TraderState {
  isConnected: boolean;
  portfolio: Position[];
  tickers: Map<string, Ticker>;
  orders: Order[];
  nextOrderId: number;
  actions: {
    connect: () => void;
    disconnect: () => void;
    subscribeTicker: (symbol: string) => void;
    unsubscribeTicker: (symbol: string) => void;
    placeOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
  };
}
// --- MOCK DATA & SIMULATION ---
const initialPortfolio: Position[] = [
  { symbol: 'AAPL', quantity: 100, averageCost: 150.0, currentPrice: 175.25, pnl: 2525.0 },
  { symbol: 'TSLA', quantity: 50, averageCost: 220.0, currentPrice: 260.5, pnl: 2025.0 },
  { symbol: 'NVDA', quantity: 75, averageCost: 400.0, currentPrice: 475.1, pnl: 5632.5 },
];
let simulationInterval: ReturnType<typeof setInterval> | null = null;
export const useTraderStore = create<TraderState>()(
  immer((set, get) => ({
    isConnected: false,
    portfolio: [],
    tickers: new Map(),
    orders: [],
    nextOrderId: 1,
    actions: {
      connect: () => {
        set((state) => {
          state.isConnected = true;
          state.portfolio = initialPortfolio;
        });
        if (simulationInterval) clearInterval(simulationInterval);
        simulationInterval = setInterval(() => {
          set((state) => {
            // Simulate portfolio price changes
            state.portfolio.forEach((pos) => {
              const change = (Math.random() - 0.5) * 2;
              const newPrice = Math.max(0, pos.currentPrice + change);
              pos.currentPrice = parseFloat(newPrice.toFixed(2));
              pos.pnl = parseFloat(((newPrice - pos.averageCost) * pos.quantity).toFixed(2));
            });
            // Simulate subscribed ticker price changes
            state.tickers.forEach((ticker) => {
              const oldPrice = ticker.price;
              const change = (Math.random() - 0.5) * (ticker.price * 0.01); // up to 1% change
              const newPrice = Math.max(0, oldPrice + change);
              ticker.price = parseFloat(newPrice.toFixed(2));
              ticker.change = parseFloat((newPrice - oldPrice).toFixed(2));
              ticker.changePercent = parseFloat((((newPrice - oldPrice) / oldPrice) * 100).toFixed(2));
            });
          });
        }, 1500);
      },
      disconnect: () => {
        if (simulationInterval) clearInterval(simulationInterval);
        simulationInterval = null;
        set((state) => {
          state.isConnected = false;
          state.portfolio = [];
          state.tickers.clear();
          state.orders = [];
        });
      },
      subscribeTicker: (symbol: string) => {
        const upperSymbol = symbol.toUpperCase();
        if (get().tickers.has(upperSymbol)) return;
        set((state) => {
          state.tickers.set(upperSymbol, {
            symbol: upperSymbol,
            price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
            change: 0,
            changePercent: 0,
          });
        });
      },
      unsubscribeTicker: (symbol: string) => {
        set((state) => {
          state.tickers.delete(symbol.toUpperCase());
        });
      },
      placeOrder: (order) => {
        set((state) => {
          const newOrder: Order = {
            ...order,
            id: state.nextOrderId,
            status: 'Submitted',
            timestamp: Date.now(),
          };
          state.orders.unshift(newOrder);
          state.nextOrderId++;
        });
      },
    },
  }))
);
// --- SELECTORS ---
export const useIsConnected = () => useTraderStore((state) => state.isConnected);
export const usePortfolio = () => useTraderStore((state) => state.portfolio);
export const useTickers = () => useTraderStore((state) => state.tickers);
export const useOrders = () => useTraderStore((state) => state.orders);
export const useTraderActions = () => useTraderStore((state) => state.actions);