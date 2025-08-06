// src/hooks/useNotificaciones.js
import { messaging, getToken, onMessage } from '../firebase-config';
import { useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// tipo puede ser: 'usuario' o 'administrador'
export default function useNotificaciones(id, tipo = 'usuario') {
    useEffect(() => {
        if (!id) return;

        Notification.requestPermission().then(async (permiso) => {
            if (permiso === 'granted') {
                try {
                    const token = await getToken(messaging, {
                        vapidKey: 'BDmwWifvJ1Uumes8Wu2Jb9fjQ9BcfYdxEBXF8HxT86CGTgWy8NhEGqmmwQZ0M4Wooz9eUHW0AyGCyqEm5QkKu0'

                    });

                    if (token) {
                        await axios.put(`${API_URL}/notificacion/${tipo}/${id}`, { token });
                        console.log('🔔 Token FCM guardado con éxito');
                    }
                } catch (error) {
                    console.error('❌ Error al obtener o guardar el token:', error);
                }
            } else {
                console.warn('⚠️ Permiso de notificación no otorgado');
            }
        });

        // Mostrar notificaciones en primer plano
        onMessage((payload) => {
            const { title, body } = payload.notification;
            alert(`${title}: ${body}`);
        });
    }, [id]);
}
