export interface Phone {
  id: string;
  model: string;
  year: number;
  image: string;
  specs: {
    battery: string;
    weight: string;
    thickness: string;
  };
  badges: {
    network: '5G' | '4G' | 'LTE';
    resilience: 'low' | 'medium' | 'high';
    batteryStatus: 'critical' | 'warning' | 'neutral' | 'good';
  };
  highlight: string;
  price: {
    installment: string;
    total: string;
  };
  isMinimized: boolean;
}
