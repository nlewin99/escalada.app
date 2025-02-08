# escalada.app

## Configuración del Proyecto

### Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Actualiza las variables en el archivo `.env` con tus credenciales de Firebase:
```
FIREBASE_API_KEY=tu-api-key
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu-messaging-id
FIREBASE_APP_ID=tu-app-id
FIREBASE_MEASUREMENT_ID=tu-measurement-id
```

3. Copia el archivo `config.example.js` a `config.js`:
```bash
cp config.example.js config.js
```

### Desarrollo Local

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm start
```

### Producción

Para producción, asegúrate de configurar las variables de entorno en tu plataforma de hosting (por ejemplo, en los secretos del repositorio de GitHub si usas GitHub Pages).