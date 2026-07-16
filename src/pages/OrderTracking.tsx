import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import { CheckCircle, Clock, Truck, ChefHat, ArrowLeft } from 'lucide-react';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (data) {
          // Normalize to match component expectations
          setOrder({
            id: data.id,
            customerName: data.customer_name,
            orderType: data.order_type,
            paymentMethod: data.payment_method,
            status: data.status,
            totalAmount: data.total_amount,
            items: data.items,
            createdAt: data.created_at
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
        <Link to="/" className="text-red-700 underline">Voltar à loja</Link>
      </div>
    );
  }

  const statusMap: Record<string, { icon: any, text: string, color: string }> = {
    'Pendente': { icon: Clock, text: 'Pendente', color: 'text-gray-500' },
    'Em Preparo': { icon: ChefHat, text: 'Em Preparo', color: 'text-orange-500' },
    'Saiu para Entrega': { icon: Truck, text: 'Saiu para Entrega', color: 'text-blue-500' },
    'Finalizado': { icon: CheckCircle, text: 'Finalizado', color: 'text-green-500' }
  };

  const currentStatus = statusMap[order.status] || statusMap['Pendente'];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
            <ArrowLeft size={16} className="mr-1" /> Voltar ao Início
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Acompanhar Pedido #{order.id}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Cliente: {order.customerName}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center space-y-4">
          <div className={`p-6 rounded-full bg-gray-50 shadow-inner ${currentStatus.color}`}>
            <StatusIcon size={64} />
          </div>
          <h3 className={`text-2xl font-bold ${currentStatus.color}`}>
            {currentStatus.text}
          </h3>
          <p className="text-gray-500 text-center">
            {order.status === 'Pendente' && 'Aguardando o restaurante aceitar seu pedido.'}
            {order.status === 'Em Preparo' && 'A nossa equipa está a preparar o seu pedido com muito carinho!'}
            {order.status === 'Saiu para Entrega' && 'O seu pedido já está a caminho!'}
            {order.status === 'Finalizado' && 'Pedido concluído. Bom apetite!'}
          </p>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h4>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                <span className="font-medium">€{(item.priceCalculated * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>€{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500 text-right">
            Pago em {order.paymentMethod}
          </div>
        </div>
      </div>
    </div>
  );
}
