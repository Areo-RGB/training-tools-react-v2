import Mic from 'lucide-react/dist/esm/icons/mic';
import Droplet from 'lucide-react/dist/esm/icons/droplet';
import Calculator from 'lucide-react/dist/esm/icons/calculator';
import Timer from 'lucide-react/dist/esm/icons/timer';
import Clock from 'lucide-react/dist/esm/icons/clock';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';

export const EUROPEAN_CAPITALS = [
  { country: 'Albanien', city: 'Tirana' },
  { country: 'Andorra', city: 'Andorra la Vella' },
  { country: 'Belgien', city: 'Brüssel' },
  { country: 'Bosnien und Herzegowina', city: 'Sarajevo' },
  { country: 'Bulgarien', city: 'Sofia' },
  { country: 'Dänemark', city: 'Kopenhagen' },
  { country: 'Deutschland', city: 'Berlin' },
  { country: 'Estland', city: 'Tallinn' },
  { country: 'Finnland', city: 'Helsinki' },
  { country: 'Frankreich', city: 'Paris' },
  { country: 'Griechenland', city: 'Athen' },
  { country: 'Irland', city: 'Dublin' },
  { country: 'Island', city: 'Reykjavík' },
  { country: 'Italien', city: 'Rom' },
  { country: 'Kosovo', city: 'Pristina' },
  { country: 'Kroatien', city: 'Zagreb' },
  { country: 'Lettland', city: 'Riga' },
  { country: 'Liechtenstein', city: 'Vaduz' },
  { country: 'Litauen', city: 'Vilnius' },
  { country: 'Luxemburg', city: 'Luxemburg' },
  { country: 'Malta', city: 'Valletta' },
  { country: 'Moldau', city: 'Chisinau' },
  { country: 'Monaco', city: 'Monaco' },
  { country: 'Montenegro', city: 'Podgorica' },
  { country: 'Niederlande', city: 'Amsterdam' },
  { country: 'Nordmazedonien', city: 'Skopje' },
  { country: 'Norwegen', city: 'Oslo' },
  { country: 'Österreich', city: 'Wien' },
  { country: 'Polen', city: 'Warschau' },
  { country: 'Portugal', city: 'Lissabon' },
  { country: 'Rumänien', city: 'Bukarest' },
  { country: 'Russland', city: 'Moskau' },
  { country: 'San Marino', city: 'San Marino' },
  { country: 'Schweden', city: 'Stockholm' },
  { country: 'Schweiz', city: 'Bern' },
  { country: 'Serbien', city: 'Belgrad' },
  { country: 'Slowakei', city: 'Bratislava' },
  { country: 'Slowenien', city: 'Ljubljana' },
  { country: 'Spanien', city: 'Madrid' },
  { country: 'Tschechien', city: 'Prag' },
  { country: 'Türkei', city: 'Ankara' },
  { country: 'Ukraine', city: 'Kiew' },
  { country: 'Ungarn', city: 'Budapest' },
  { country: 'Vatikanstadt', city: 'Vatikanstadt' },
  { country: 'Vereinigtes Königreich', city: 'London' },
  { country: 'Weißrussland', city: 'Minsk' }
];

export const COLORS_DATA = [
  { name: 'weiß', class: 'bg-gray-100 text-black', hex: '#f3f4f6' },
  { name: 'rot', class: 'bg-red-600 text-white', hex: '#dc2626' },
  { name: 'blau', class: 'bg-blue-600 text-white', hex: '#2563eb' },
  { name: 'grün', class: 'bg-green-600 text-white', hex: '#16a34a' },
  { name: 'gelb', class: 'bg-yellow-400 text-black', hex: '#facc15' },
];

export const TOOLS = [
  {
    id: 'sound-counter',
    name: 'Sound-Zähler',
    description: 'Erhöht einen Zähler, wenn der Geräuschpegel einen Schwellenwert überschreitet',
    path: '/sound-counter',
    icon: Mic,
    tags: ['AUDIO', 'TRIGGER'],
    accentColor: 'border-l-blue-500'
  },
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
  {
    id: 'timers',
    name: 'Timer',
    description: 'Intervall-Timer und Schleifen-Voreinstellungen',
    path: '/timers',
    icon: Timer,
    tags: ['WERKZEUG', 'INTERVALL'],
    accentColor: 'border-l-orange-500'
  },
  {
    id: 'intervall',
    name: 'Intervall',
    description: 'Setze benutzerdefinierte Intervalle für Audio-Erinnerungen',
    path: '/intervall',
    icon: Clock,
    tags: ['AUDIO', 'TAKT'],
    accentColor: 'border-l-cyan-500'
  },
  {
    id: 'capitals',
    name: 'Hauptstädte Quiz',
    description: 'Teste dein Wissen über europäische Hauptstädte',
    path: '/capitals',
    icon: MapPin,
    tags: ['GEOGRAPHIE', 'GEDÄCHTNIS'],
    accentColor: 'border-l-indigo-500'
  }
];