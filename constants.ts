
import Droplet from 'lucide-react/dist/esm/icons/droplet';
import Calculator from 'lucide-react/dist/esm/icons/calculator';




export const COLORS_DATA = [
  { name: 'weiß', class: 'bg-gray-100 text-black', hex: '#f3f4f6' },
  { name: 'rot', class: 'bg-red-600 text-white', hex: '#dc2626' },
  { name: 'blau', class: 'bg-blue-600 text-white', hex: '#2563eb' },
  { name: 'grün', class: 'bg-green-600 text-white', hex: '#16a34a' },
  { name: 'gelb', class: 'bg-yellow-400 text-black', hex: '#facc15' },
];

export const TOOLS = [

  {
    id: 'farben',
    name: 'Farben',
    description: 'Stroop-Effekt-Trainer. Farben und Wörter blinken zur Reaktionsschulung',
    path: '/farben',
    icon: Droplet,
    tags: ['KOGNITIV', 'REAKTION'],
    accentColor: 'border-l-purple-500'
  },
  {
    id: 'kettenrechner',
    name: 'Kettenrechner',
    description: 'Kopfrechnen-Kettenaufgaben. Löse fortlaufende Rechenoperationen',
    path: '/kettenrechner',
    icon: Calculator,
    tags: ['MATHE', 'FOKUS'],
    accentColor: 'border-l-green-500'
  },

];