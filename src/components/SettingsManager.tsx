import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save } from 'lucide-react';

export default function SettingsManager() {
  const [feedback, setFeedback] = useState("");
  const [promoConfig, setPromoConfig] = useState({
    active: false,
    image_url: '',
    title: '🎉 Bem-vindo(a) ao 41 Menu\'s!',
    message: 'Agradecemos a sua visita e é com grande alegria que o(a) recebemos.\nSou a Giovanna e estou pronta para o(a) atender. 😊\nEnvie-nos uma mensagem pelo WhatsApp e teremos todo o gosto em ajudá-lo(a)!',
    button_text: 'Falar no WhatsApp'
  });

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from('menu_items').select('*').eq('id', 'system_config_promo').single();
      if (data && data.ingredients) {
        try {
          const parsed = JSON.parse(data.ingredients);
          setPromoConfig(parsed);
        } catch (e) { console.error("Error parsing config", e); }
      }
    }
    loadSettings();
  }, []);


  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setFeedback("Fazendo upload da imagem...");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `41menus/promocoes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Cardapio')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('Cardapio')
        .getPublicUrl(filePath);

      setPromoConfig({ ...promoConfig, image_url: data.publicUrl });
      setFeedback("Upload de imagem concluído com sucesso!");
    } catch (error: any) {
      console.error(error);
      setFeedback("Erro no upload (certifique-se de que criou um bucket 'images' público no Supabase): " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Salvando...");
    
    const dbItem = {
      id: 'system_config_promo',
      name: 'Configurações de Promoção',
      category: 'system_config', // Hidden category
      ingredients: JSON.stringify(promoConfig),
    };

    // Make sure category exists just in case
    await supabase.from('categories').upsert({ id: 'system_config', name: 'Configurações do Sistema', order_index: 99 }, { onConflict: 'id' });
    const { error } = await supabase.from('menu_items').upsert(dbItem, { onConflict: 'id' });
    
    if (error) setFeedback("Erro: " + error.message);
    else setFeedback("Salvo com sucesso!");
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Avisos e Promoções (Pop-up Inicial)</h2>
          <p className="text-sm text-gray-500">Configure o banner que aparece quando o cliente acessa o cardápio.</p>
        </div>

        {feedback && <div className="mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">{feedback}</div>}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <input 
              type="checkbox" 
              id="promo-active"
              checked={promoConfig.active}
              onChange={e => setPromoConfig({...promoConfig, active: e.target.checked})}
              className="w-5 h-5 text-[#ea1d2c] rounded border-gray-300 focus:ring-[#ea1d2c]"
            />
            <label htmlFor="promo-active" className="font-medium text-gray-900 cursor-pointer">
              Ativar Pop-up de Promoção/Aviso
            </label>
          </div>

          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Imagem do Pop-up</label>
            
            <div className="flex gap-3 items-center">
              <input 
                type="text" 
                value={promoConfig.image_url} 
                onChange={e => setPromoConfig({...promoConfig, image_url: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                placeholder="URL da imagem ou faça o upload abaixo"
              />
            </div>
            {promoConfig.image_url && (
              <img src={promoConfig.image_url.startsWith('http') ? promoConfig.image_url : (promoConfig.image_url.startsWith('/') ? promoConfig.image_url : '/' + promoConfig.image_url)} alt="preview" className="h-32 rounded-lg object-cover mt-2 border border-gray-200" />
            )}

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ou faça upload do seu computador (Recomendado)</label>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#ea1d2c]/10 file:text-[#ea1d2c]
                  hover:file:bg-[#ea1d2c]/20
                  cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">Formatos aceitos: JPG, PNG, WEBP. A imagem será salva no bucket "images" do seu Supabase.</p>
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <input 
              type="text" 
              value={promoConfig.title} 
              onChange={e => setPromoConfig({...promoConfig, title: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mensagem (Texto do aviso)</label>
            <textarea 
              rows={4}
              value={promoConfig.message} 
              onChange={e => setPromoConfig({...promoConfig, message: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Texto do Botão (Deixe vazio para esconder o botão do WhatsApp)</label>
            <input 
              type="text" 
              value={promoConfig.button_text} 
              onChange={e => setPromoConfig({...promoConfig, button_text: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="px-6 py-3 bg-[#ea1d2c] text-white rounded-xl font-medium hover:bg-[#c91825] transition-colors flex items-center gap-2">
              <Save size={18} /> Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
