const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  socket.on('join', (room) => {
    socket.join(room);
  });
});

// Endpoint for the worker to publish price updates
app.post('/publish', (req, res) => {
  const { itemId, region, prices } = req.body || {};
  if (!itemId || !prices) return res.status(400).json({ error: 'missing itemId or prices' });

  // broadcast to room for this item
  io.to(`item:${itemId}`).emit('price_update', { itemId, region, prices, ts: Date.now() });
  // also broadcast to global channel
  io.emit('price_update_global', { itemId, region, prices, ts: Date.now() });

  // if the worker included an opportunity object, broadcast it separately
  if (req.body.opportunity) {
    io.emit('flip_opportunity', req.body.opportunity);
  }

  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
