"use client";

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function MarketLive() {
  const [opps, setOpps] = useState([]);
  useEffect(() => {
    const SOCKET = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const socket = io(SOCKET, { transports: ['websocket'] });

    socket.on('connect', () => console.log('market socket connected', socket.id));
    socket.on('flip_opportunity', (data) => {
      setOpps((s) => [data, ...s].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Flip Opportunities</h1>
      {opps.length === 0 && <p className="text-slate-500">Waiting for opportunities...</p>}
      <div className="space-y-3">
        {opps.map((o) => (
          <div key={o.ts} className="p-3 border rounded bg-white shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-slate-500">{o.itemId}</div>
                <div className="text-lg font-semibold">{o.from} → {o.to}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Buy: {o.buyPrice}</div>
                <div className="text-sm">Sell: {o.sellPrice}</div>
                <div className="text-xl font-bold text-emerald-600">Profit: {o.profit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
