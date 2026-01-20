export interface Phone {
  id: string;
  model: string;
  year: number;
  image: string;
  specs: {
    screen?: string;      // ex: "6.8 inch P-OLED"
    chipset?: string;     // ex: "Snapdragon 765G"
    ram?: string;         // ex: "6GB/8GB"
    storage?: string;     // ex: "128GB"
    battery: string;      // ex: "4300 mAh"
    cameras?: string;     // ex: "48MP (Wide) | 8MP (Ultra)"
    dimensions?: string;  // ex: "167.2 x 74.1 x 7.9 mm"
    weight: string;       // ex: "180 g"
    thickness?: string;   // ex: "7.9mm"
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
