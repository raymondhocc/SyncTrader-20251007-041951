import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, LineChart, Package, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useIsConnected, usePortfolio, useTickers, useOrders, useTraderActions, Position, Ticker, Order, OrderSide, OrderType, useTraderStore } from '@/lib/trader-store';
const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const PnlText: React.FC<{ value: number }> = ({ value }) => (
  <span className={cn('font-mono', value >= 0 ? 'text-success' : 'text-danger')}>
    {value >= 0 ? '+' : ''}{formatCurrency(value)}
  </span>
);
const PortfolioTab: React.FC = () => {
  const portfolio = usePortfolio();
  const isConnected = useIsConnected();
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">Portfolio is Empty</h3>
        <p className="text-muted-foreground">Connect to view your positions.</p>
      </div>
    );
  }
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle>Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-700">
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg. Cost</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolio.map((pos) => (
              <TableRow key={pos.symbol} className="font-mono hover:bg-gray-700/50 border-gray-700">
                <TableCell className="font-medium">{pos.symbol}</TableCell>
                <TableCell className="text-right">{pos.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(pos.averageCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(pos.currentPrice)}</TableCell>
                <TableCell className="text-right"><PnlText value={pos.pnl} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
const MarketDataTab: React.FC = () => {
  const tickersMap = useTickers();
  const tickers = useMemo(() => Array.from(tickersMap.values()), [tickersMap]);
  const { subscribeTicker, unsubscribeTicker } = useTraderActions();
  const [newTicker, setNewTicker] = useState('');
  const isConnected = useIsConnected();
  const handleAddTicker = () => {
    if (newTicker.trim()) {
      subscribeTicker(newTicker.trim());
      setNewTicker('');
    }
  };
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <LineChart className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No Market Data</h3>
        <p className="text-muted-foreground">Connect to subscribe to tickers.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Subscribe to Ticker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., GOOGL"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
              className="bg-gray-900 border-gray-600 focus:ring-blue-500"
            />
            <Button onClick={handleAddTicker} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickers.map((ticker) => (
          <Card key={ticker.symbol} className="bg-gray-800/50 border-gray-700 relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6 text-gray-500 hover:text-white hover:bg-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => unsubscribeTicker(ticker.symbol)}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{ticker.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{formatCurrency(ticker.price)}</div>
              <p className={cn("text-xs font-mono", ticker.change >= 0 ? 'text-success' : 'text-danger')}>
                {ticker.change >= 0 ? '+' : ''}{formatNumber(ticker.change)} ({ticker.changePercent}%)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
const OrdersTab: React.FC = () => {
  const orders = useOrders();
  const { placeOrder } = useTraderActions();
  const isConnected = useIsConnected();
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [side, setSide] = useState<OrderSide>('BUY');
  const [type, setType] = useState<OrderType>('MKT');
  const [limitPrice, setLimitPrice] = useState('');
  const handlePlaceOrder = () => {
    const qty = parseInt(quantity, 10);
    if (!symbol.trim() || isNaN(qty) || qty <= 0) {
      toast.error('Invalid order details. Please check symbol and quantity.');
      return;
    }
    const orderDetails: Omit<Order, 'id' | 'status' | 'timestamp'> = {
      symbol: symbol.toUpperCase(),
      quantity: qty,
      side,
      type,
    };
    if (type === 'LMT') {
      const price = parseFloat(limitPrice);
      if (isNaN(price) || price <= 0) {
        toast.error('Invalid limit price.');
        return;
      }
      orderDetails.limitPrice = price;
    }
    placeOrder(orderDetails);
    toast.success(`Order for ${qty} ${symbol} submitted.`);
    setSymbol('');
    setQuantity('');
    setLimitPrice('');
  };
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No Orders</h3>
        <p className="text-muted-foreground">Connect to place and view orders.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle>New Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" placeholder="e.g., AAPL" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} className="bg-gray-900 border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="100" value={quantity} onChange={e => setQuantity(e.target.value)} className="bg-gray-900 border-gray-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Side</Label>
                <Select value={side} onValueChange={(v: OrderSide) => setSide(v)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="BUY">Buy</SelectItem><SelectItem value="SELL">Sell</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: OrderType) => setType(v)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="MKT">Market</SelectItem><SelectItem value="LMT">Limit</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {type === 'LMT' && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="limit-price">Limit Price</Label>
                <Input id="limit-price" type="number" placeholder="150.50" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="bg-gray-900 border-gray-600" />
              </div>
            )}
            <Button onClick={handlePlaceOrder} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Place Order</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle>Open Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-700">
                  <TableHead>ID</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? orders.map(order => (
                  <TableRow key={order.id} className="font-mono hover:bg-gray-700/50 border-gray-700">
                    <TableCell>{order.id}</TableCell>
                    <TableCell className="font-medium">{order.symbol}</TableCell>
                    <TableCell className={cn(order.side === 'BUY' ? 'text-success' : 'text-danger')}>{order.side}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.type}{order.type === 'LMT' ? ` @ ${formatCurrency(order.limitPrice!)}` : ''}</TableCell>
                    <TableCell>{order.status}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow className="hover:bg-transparent border-gray-700">
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No open orders</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export function HomePage() {
  const isConnected = useIsConnected();
  const { connect, disconnect } = useTraderActions();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    document.documentElement.classList.add('dark');
    // On component unmount, disconnect to clean up intervals from the store
    return () => {
      if (useTraderStore.getState().isConnected) {
        useTraderStore.getState().actions.disconnect();
      }
    };
  }, []);
  const handleToggleConnection = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (isConnected) {
        disconnect();
        toast.info('Disconnected from IB Sync');
      } else {
        connect();
        toast.success('Connected to IB Sync');
      }
      setIsLoading(false);
    }, 1000);
  };
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <header className="py-4 px-8 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-blue-500">Sync</span>Trader
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full transition-colors", isConnected ? 'bg-green-500' : 'bg-red-500')} />
            <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <Button
            onClick={handleToggleConnection}
            disabled={isLoading}
            className={cn(
              "transition-all duration-200 w-32",
              isConnected ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700",
              "text-white"
            )}
          >
            {isLoading ? <Skeleton className="h-5 w-20 bg-gray-700" /> : (isConnected ? 'Disconnect' : 'Connect')}
          </Button>
        </div>
      </header>
      <main className="p-4 sm:p-8">
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="market-data">Market Data</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
            <TabsContent value="portfolio" className="mt-6">
                <PortfolioTab />
            </TabsContent>
            <TabsContent value="market-data" className="mt-6">
                <MarketDataTab />
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
                <OrdersTab />
            </TabsContent>
        </Tabs>
      </main>
      <Toaster richColors theme="dark" />
    </div>
  );
}