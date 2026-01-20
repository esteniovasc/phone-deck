import { Plus, Settings, Download } from 'lucide-react';
import { PhoneCard } from './components/cards/PhoneCard';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Phone } from './types';

const initialData: Phone[] = [
  {
    id: '1',
    model: 'LG Velvet 5G',
    year: 2020,
    image: 'https://www.lg.com/content/dam/channel/wcms/br/images/celulares/lmg910emw_abraaw_essp_br_c/gallery/DZ-02.jpg?w=800',
    specs: { battery: '4300mAh', weight: '180g', thickness: '7.9mm' },
    badges: { network: '5G', resilience: 'medium', batteryStatus: 'neutral' },
    highlight: 'Design Raindrop & Tela P-OLED',
    price: { installment: '12x R$ 70,83', total: 'R$ 850' },
    isMinimized: false,
  },
];

function App() {
  const [phones, setPhones] = useLocalStorage<Phone[]>('phonedeck-data', initialData);

  const handleAddPhone = () => {
    const newPhone: Phone = {
      id: Date.now().toString(),
      model: 'LG Velvet 5G',
      year: 2020,
      image: 'https://www.lg.com/content/dam/channel/wcms/br/images/celulares/lmg910emw_abraaw_essp_br_c/gallery/DZ-02.jpg?w=800',
      specs: { battery: '4300mAh', weight: '180g', thickness: '7.9mm' },
      badges: { network: '5G', resilience: 'medium', batteryStatus: 'neutral' },
      highlight: 'Design Raindrop & Tela P-OLED',
      price: { installment: '12x R$ 70,83', total: 'R$ 850' },
      isMinimized: false,
    };
    setPhones([...phones, newPhone]);
  };

  const handleToggleMinimize = (id: string) => {
    setPhones(
      phones.map((phone) =>
        phone.id === id ? { ...phone, isMinimized: !phone.isMinimized } : phone
      )
    );
  };

  const handleBackupJSON = () => {
    const dataStr = JSON.stringify(phones, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phonedeck-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Fixo */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">PhoneDeck</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackupJSON}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
              title="Fazer backup dos dados"
            >
              <Download className="w-4 h-4" />
              Backup
            </button>

            <button
              onClick={handleAddPhone}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
              title="Adicionar novo telefone"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>

            <button
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Área de Conteúdo */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {phones.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-slate-500 text-lg">Nenhum telefone adicionado ainda.</p>
              <button
                onClick={handleAddPhone}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Adicionar Primeiro Telefone
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {phones.map((phone) => (
              <PhoneCard
                key={phone.id}
                data={phone}
                onToggleMinimize={handleToggleMinimize}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App
