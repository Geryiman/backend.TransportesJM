const mercadopago = require('../config/mercadopago');
const db = require('../config/db');

const crearLinkPago = async (req, res) => {
  const { reservaId, nombre, asiento, monto } = req.body;

  try {
    const preference = {
      items: [
        {
          title: `Asiento ${asiento} - Transportes JM`,
          unit_price: parseFloat(monto),
          quantity: 1,
        }
      ],
      payer: {
        name: nombre
      },
      back_urls: {
        success: `${process.env.BASE_URL}/api/pagos/success`,
        failure: `${process.env.BASE_URL}/api/pagos/failure`,
        pending: `${process.env.BASE_URL}/api/pagos/pending`,
      },
      notification_url: `${process.env.BASE_URL}/api/pagos/webhook`,
      metadata: {
        reserva_id: reservaId
      }
    };

    const result = await mercadopago.preferences.create(preference);
    return res.json({ url: result.body.init_point });
  } catch (error) {
    console.error('❌ Error al crear link de pago:', error);
    res.status(500).json({ error: 'Error al crear link de pago' });
  }
};

// Webhook automático de Mercado Pago
const recibirWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const payment = await mercadopago.payment.findById(data.id);
      const { status, metadata, id } = payment.body;

      if (status === 'approved') {
        const reservaId = metadata.reserva_id;

        // Marcar como pagado
        await db.promise().query(
          `UPDATE reservas SET metodo_pago = 'tarjeta', pago_confirmado = 1, referencia_pago = ? WHERE id = ?`,
          [id, reservaId]
        );

        console.log(`✅ Pago confirmado para la reserva ${reservaId}`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en webhook de Mercado Pago:', error);
    res.sendStatus(500);
  }
};

module.exports = {
  crearLinkPago,
  recibirWebhook
};
