import React from 'react';
import { PlayerStats, AvatarConfig } from '../types';
import { sounds } from '../audio/soundEngine';
import { X, ShoppingBag, Coins, Check, Sparkles } from 'lucide-react';

interface ShopModalProps {
  stats: PlayerStats;
  avatar: AvatarConfig;
  onBuyItem: (item: string, cost: number, type: 'accessory' | 'outfit' | 'item') => void;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  type: 'accessory' | 'outfit' | 'item';
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'headset', name: 'Headset Pro Gamer', icon: '🎧', cost: 100, type: 'accessory', description: 'Isolamento acústico com microfone para foco total.' },
  { id: 'glasses', name: 'Óculos com Filtro Azul', icon: '👓', cost: 120, type: 'accessory', description: 'Protege a visão contra o cansaço do monitor.' },
  { id: 'cap', name: 'Boné Dev ABNT2', icon: '🧢', cost: 90, type: 'accessory', description: 'Estilo clássico da equipe de informática.' },
  { id: 'visor', name: 'Visor Cibernético', icon: '🥽', cost: 180, type: 'accessory', description: 'Mapeador holográfico de teclas.' },
  { id: 'badge', name: 'Broche da Sabedoria', icon: '⭐', cost: 150, type: 'accessory', description: 'Homenagem aos Guardiões da Sabedoria.' },
  { id: 'tech', name: 'Traje Cibernético', icon: '🦾', cost: 250, type: 'outfit', description: 'Armadura leve para digitação supersônica.' },
  { id: 'jacket', name: 'Jaqueta Piloto Nitro', icon: '🏎️', cost: 200, type: 'outfit', description: 'Uniforme de campeão do Autódromo NitroType.' },
  { id: 'trophy', name: 'Troféu Ouro ABNT2', icon: '🏆', cost: 300, type: 'item', description: 'Símbolo máximo de quem domina os 10 dedos.' },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  stats,
  avatar,
  onBuyItem,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Loja de Recompensas e Acessórios</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1 rounded-xl text-amber-400 text-xs font-bold border border-slate-700">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.coins} moedas</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 mb-4">
          Troque as moedas conquistadas nas atividades pedagógicas por equipamentos e personalizações para seu avatar!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {SHOP_ITEMS.map((item) => {
            const isOwned = stats.inventory.includes(item.id);
            const isEquipped =
              (item.type === 'accessory' && avatar.accessory === item.id) ||
              (item.type === 'outfit' && avatar.outfit === item.id);

            return (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                  <div className="text-[11px] font-bold text-amber-400 mt-0.5">🪙 {item.cost}</div>
                </div>

                <button
                  onClick={() => onBuyItem(item.id, item.cost, item.type)}
                  disabled={!isOwned && stats.coins < item.cost}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    isEquipped
                      ? 'bg-emerald-600 text-white cursor-default'
                      : isOwned
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : stats.coins >= item.cost
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isEquipped ? 'Equipado' : isOwned ? 'Equipar' : 'Comprar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
