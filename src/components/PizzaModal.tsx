import React, { useState, useEffect } from 'react';
import { MenuItem, menuPizzas, ExtraIngredient, pizzaExtras, menuBordas } from '../data/menu';
import { CartItem } from '../types';
import { X, Check, ShoppingBag } from 'lucide-react';

interface PizzaModalProps {
  item: MenuItem | null;
  pausedItems?: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem, openCart?: boolean) => void;
  initialSize: 'P' | 'M' | 'G';
}

export default function PizzaModal({ item, isOpen, onClose, onAddToCart, initialSize, pausedItems }: PizzaModalProps) {
  const [selectedSize, setSelectedSize] = useState<'P' | 'M' | 'G'>(initialSize);
  const [isHalf, setIsHalf] = useState(false);
  const [secondFlavorId, setSecondFlavorId] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<ExtraIngredient[]>([]);
  const [selectedBorda, setSelectedBorda] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (isOpen && item) {
       setSelectedSize(item.priceM === undefined ? 'G' : initialSize);
       setIsHalf(false);
       setSecondFlavorId('');
       setSelectedExtras([]);
       setSelectedBorda(null);
       setQuantity(1);
       setNotes('');
           }
  }, [isOpen, item, initialSize]);

  if (!isOpen || !item) return null;



  const hasSizes = item.priceM !== undefined && item.priceG !== undefined;
  const calculatedPriceP = item.priceP || (item.priceM ? Math.max(item.priceM - 2, 0) : undefined);
  
  // Calculate display price based on size and half-and-half
  let currentPrice = selectedSize === 'P' ? calculatedPriceP : selectedSize === 'M' ? item.priceM : (item.priceG || item.priceSingle || item.priceM || 0);
  const selectedSecondFlavor = menuPizzas.find(p => p.id === secondFlavorId);
  if (selectedSize === 'G' && isHalf && selectedSecondFlavor && selectedSecondFlavor.priceG) {
       currentPrice = Math.max(item.priceG || 0, selectedSecondFlavor.priceG);
  }

  // Add the price of selected extras
  const extrasTotalPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  if (currentPrice !== undefined) {
    currentPrice += extrasTotalPrice;
    if (selectedBorda && selectedBorda.priceSingle !== undefined) {
      currentPrice += selectedBorda.priceSingle;
    }
  }

  const handleToggleExtra = (extra: ExtraIngredient) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(e => e.id === extra.id);
      if (isSelected) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleAdd = (openCart: boolean) => {
    let finalExtras = [...selectedExtras];
    if (selectedBorda) {
      finalExtras.unshift({ id: selectedBorda.id, name: selectedBorda.name, price: selectedBorda.priceSingle! });
    }

    onAddToCart({
      id: crypto.randomUUID(),
      menuItem: item,
      quantity: quantity,
      size: hasSizes ? selectedSize : undefined,
      isHalfAndHalf: (selectedSize === 'G' && isHalf && !!selectedSecondFlavor),
      halfAndHalfFlavor: selectedSecondFlavor,
      extras: finalExtras,
      priceCalculated: currentPrice!,
      notes: notes.trim() ? notes.trim() : undefined
    }, openCart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-[#1a1a1a] flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <h3 className="font-bold text-lg">{item.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
           <p className="text-gray-500 text-sm mb-6 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{item.ingredients}</p>

           {hasSizes && (
             <div className="mb-6">
                <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-800">Escolha o Tamanho:</h4>
                <div className="flex flex-col gap-3">
                   {calculatedPriceP !== undefined && <button 
                     onClick={() => setSelectedSize('P')}
                     disabled={pausedItems?.includes(`${item?.id}-P`)}
                     className={`p-3 rounded-xl border-2 text-left transition-all ${pausedItems?.includes(`${item?.id}-P`) ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : (selectedSize === 'P' ? 'border-[#8b0000] bg-[#8b0000]/5' : 'border-gray-200 hover:border-gray-300 bg-white')}`}
                   >
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-sm">Pequena (P)</span>
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSize === 'P' ? 'border-[#8b0000] bg-[#8b0000]' : 'border-gray-300'}`}>
                            {selectedSize === 'P' && <Check className="w-3 h-3 text-white" />}
                         </div>
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-1">6 fatias | 1 sabor</span>
                      <span className="text-[#8b0000] font-bold mt-2 block text-lg">€ {calculatedPriceP.toFixed(2)}</span>
                   </button>}

                   <button 
                     onClick={() => { setSelectedSize('M'); setIsHalf(false); }}
                     disabled={pausedItems?.includes(`${item?.id}-M`)}
                     className={`p-3 rounded-xl border-2 text-left transition-all ${pausedItems?.includes(`${item?.id}-M`) ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : (selectedSize === 'M' ? 'border-[#8b0000] bg-[#8b0000]/5' : 'border-gray-200 hover:border-gray-300 bg-white')}`}
                   >
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-sm">Média (M)</span>
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSize === 'M' ? 'border-[#8b0000] bg-[#8b0000]' : 'border-gray-300'}`}>
                            {selectedSize === 'M' && <Check className="w-3 h-3 text-white" />}
                         </div>
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-1">8 fatias | 1 sabor</span>
                      <span className="text-[#8b0000] font-bold mt-2 block text-lg">€ {item.priceM?.toFixed(2)}</span>
                   </button>

                   <button 
                     onClick={() => setSelectedSize('G')}
                     disabled={pausedItems?.includes(`${item?.id}-G`)}
                     className={`p-3 rounded-xl border-2 text-left transition-all ${pausedItems?.includes(`${item?.id}-G`) ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : (selectedSize === 'G' ? 'border-[#8b0000] bg-[#8b0000]/5' : 'border-gray-200 hover:border-gray-300 bg-white')}`}
                   >
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-sm">Grande (G)</span>
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSize === 'G' ? 'border-[#8b0000] bg-[#8b0000]' : 'border-gray-300'}`}>
                            {selectedSize === 'G' && <Check className="w-3 h-3 text-white" />}
                         </div>
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-1">10 fatias | até 2 sabores</span>
                      <span className="text-[#8b0000] font-bold mt-2 block text-lg">€ {item.priceG?.toFixed(2)}</span>
                   </button>
                </div>
             </div>
           )}

           {hasSizes && selectedSize === 'G' && (
              <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isHalf}
                    onChange={(e) => { setIsHalf(e.target.checked); if(!e.target.checked) setSecondFlavorId(''); }}
                    className="w-5 h-5 accent-[#8b0000] rounded"
                  />
                  <div>
                    <span className="font-bold block text-sm">Adicionar 2º Sabor (Opcional)</span>
                    <span className="text-xs text-gray-500">Será cobrado pelo sabor mais caro</span>
                  </div>
                </label>

                {isHalf && (
                  <div className="mt-4">
                    <select
                      value={secondFlavorId}
                      onChange={(e) => setSecondFlavorId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b0000] text-sm"
                    >
                      <option value="">Selecione o 2º sabor...</option>
                      {menuPizzas.filter(p => p.id !== item.id && p.id !== 'p-61' && p.priceG !== undefined).map(p => (
                        <option key={p.id} value={p.id}>
                          MEIA {p.name} (Tira-teima: €{Math.max(p.priceG || 0, item.priceG || 0).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
           )}

           {/* Borda Selection */}
           {hasSizes && (
             <div className="mb-6">
               <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-800">Borda Recheada (Opcional):</h4>
               <div className="flex flex-col gap-2">
                 <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${!selectedBorda ? 'border-[#8b0000] bg-[#8b0000]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                   <div className="flex items-center gap-3">
                     <input 
                       type="radio" 
                       name="borda"
                       checked={!selectedBorda}
                       onChange={() => setSelectedBorda(null)}
                       className="w-5 h-5 accent-[#8b0000]"
                     />
                     <span className="font-medium text-sm">Sem Borda</span>
                   </div>
                 </label>
                 {menuBordas.map((borda) => {
                   const isSelected = selectedBorda?.id === borda.id;
                   return (
                     <label key={borda.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${isSelected ? 'border-[#8b0000] bg-[#8b0000]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                       <div className="flex items-center gap-3">
                         <input 
                           type="radio" 
                           name="borda"
                           checked={isSelected}
                           onChange={() => setSelectedBorda(borda)}
                           className="w-5 h-5 accent-[#8b0000]"
                         />
                         <span className="font-medium text-sm">{borda.name}</span>
                       </div>
                       <span className="text-[#8b0000] font-bold text-sm">+ € {borda.priceSingle!.toFixed(2)}</span>
                     </label>
                   );
                 })}
               </div>
             </div>
           )}

           {/* Extras Selection */}
           {item.category !== 'bebidas' && item.category !== 'bordas' && (
             <div className="mb-6">
               <h4 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-800">Adicionais Extras (Opcional):</h4>
               <div className="flex flex-col gap-2">
                 {pizzaExtras.map((extra) => {
                   const isSelected = selectedExtras.some(e => e.id === extra.id);
                   return (
                     <label key={extra.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${isSelected ? 'border-[#8b0000] bg-[#8b0000]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                       <div className="flex items-center gap-3">
                         <input 
                           type="checkbox" 
                           checked={isSelected}
                           onChange={() => handleToggleExtra(extra)}
                           className="w-5 h-5 accent-[#8b0000] rounded"
                         />
                         <span className="font-medium text-sm">{extra.name}</span>
                       </div>
                       <span className="text-[#8b0000] font-bold text-sm">+ € {extra.price.toFixed(2)}</span>
                     </label>
                   );
                 })}
               </div>
             </div>
           )}

           {/* Campo de Observações */}
           {item.category !== 'bebidas' && (
             <div className="mb-6">
               <div className="flex justify-between items-center mb-2">
                 <label htmlFor="order-notes" className="font-bold text-sm uppercase tracking-wide text-gray-800">
                   Observações do Pedido
                 </label>
                 <span className="text-xs text-gray-400">{notes.length}/250</span>
               </div>
               <textarea
                 id="order-notes"
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 maxLength={250}
                 rows={3}
                 placeholder="Ex.: Sem cebola, sem queijo, massa bem assada, cortar em 8 pedaços..."
                 className="w-full p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-[#8b0000] focus:outline-none transition-colors resize-none placeholder:text-gray-400"
               />
             </div>
           )}

           <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
                 className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#8b0000] font-bold text-xl hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
               >
                 -
               </button>
               <span className="font-bold text-xl w-6 text-center text-gray-800">{quantity}</span>
               <button 
                 onClick={() => setQuantity(quantity + 1)}
                 className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#8b0000] font-bold text-xl hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
               >
                 +
               </button>
             </div>
             <div className="text-right">
               <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total</div>
               <div className="text-[#8b0000] font-bold text-2xl">€ {((currentPrice || 0) * quantity).toFixed(2)}</div>
             </div>
           </div>

           <div className="flex flex-col gap-3">
             <button 
               onClick={() => handleAdd(true)}
               disabled={isHalf && !secondFlavorId}
               className="w-full bg-[#8b0000] hover:bg-[#660000] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-transform active:scale-[0.98] shadow-md flex justify-center items-center gap-2"
             >
               <ShoppingBag className="w-5 h-5" />
               Adicionar e ver pedido
             </button>
             <button 
               onClick={() => handleAdd(false)}
               disabled={isHalf && !secondFlavorId}
               className="w-full bg-white text-[#8b0000] border-2 border-[#8b0000] disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed font-bold py-3.5 px-4 rounded-xl transition-transform active:scale-[0.98] flex justify-center items-center gap-2"
             >
               Adicionar e continuar comprando
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
