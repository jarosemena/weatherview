# 🌤️ WeatherView

Un dashboard interactivo de visualización de datos climáticos desarrollado con React, TypeScript y styled-components. Consulta el clima actual, visualiza pronósticos mediante gráficos interactivos y compara múltiples ciudades simultáneamente.

![WeatherView Dashboard](https://via.placeholder.com/800x400?text=WeatherView+Dashboard)

## ✨ Características

- 🌍 **Geolocalización automática**: Detecta tu ubicación y muestra el clima local
- 🔍 **Búsqueda de ciudades**: Encuentra y visualiza el clima de cualquier ciudad del mundo
- 📊 **Gráficos interactivos**: Visualiza tendencias de temperatura, precipitación y viento con Chart.js
- 🏙️ **Comparación de ciudades**: Compara hasta 4 ciudades simultáneamente
- ⭐ **Ciudades favoritas**: Guarda tus ubicaciones favoritas para acceso rápido
- 🌡️ **Unidades personalizables**: Alterna entre Celsius y Fahrenheit
- 💾 **Persistencia local**: Tus preferencias se guardan automáticamente
- 📱 **Diseño responsive**: Funciona perfectamente en móvil, tablet y desktop
- ⚡ **Rendimiento optimizado**: Code splitting y lazy loading
- ♿ **Accesible**: Cumple con estándares WCAG AA

## 🚀 Demo en Vivo

Visita la aplicación desplegada: [https://tu-usuario.github.io/weatherview/](https://tu-usuario.github.io/weatherview/)

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Estilos**: styled-components 6
- **Gráficos**: Chart.js + react-chartjs-2
- **Estado**: Context API + React Query
- **HTTP**: Axios
- **Testing**: Vitest + React Testing Library
- **Build**: Vite
- **Deployment**: GitHub Pages + GitHub Actions

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de GitHub (para deployment)

## 🔧 Instalación

1. **Clona el repositorio**

```bash
git clone https://github.com/tu-usuario/weatherview.git
cd weatherview
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Configura las variables de entorno**

Crea un archivo `.env` en la raíz del proyecto (opcional):

```env
# Ciudad por defecto (opcional)
VITE_DEFAULT_CITY=London
```

> **Nota**: Esta aplicación usa Open-Meteo API que es completamente gratuita y no requiere API key.

4. **Inicia el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Preview del build de producción

# Testing
npm test             # Ejecuta tests en modo watch
npm run test:ui      # Abre UI de Vitest
npm run coverage     # Genera reporte de cobertura

# Deployment
npm run deploy       # Despliega a GitHub Pages

# Linting
npm run lint         # Ejecuta ESLint
```

## 🧪 Testing

El proyecto implementa TDD (Test-Driven Development) con una cobertura de código superior al 80%.

```bash
# Ejecutar todos los tests
npm test

# Ver cobertura
npm run coverage

# UI interactiva de tests
npm run test:ui
```

### Estructura de Tests

- **Unit Tests**: Funciones puras y utilidades
- **Component Tests**: Componentes React individuales
- **Integration Tests**: Flujos completos de usuario

## 📁 Estructura del Proyecto

```
weatherview/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD con GitHub Actions
├── src/
│   ├── components/             # Componentes React
│   │   ├── Dashboard/
│   │   ├── CitySearch/
│   │   ├── WeatherCard/
│   │   ├── ChartView/
│   │   └── CityComparison/
│   ├── hooks/                  # Custom hooks
│   │   ├── useWeatherData.ts
│   │   ├── useGeolocation.ts
│   │   └── useUserPreferences.ts
│   ├── services/               # Servicios de datos
│   │   ├── weatherApi.ts
│   │   ├── geolocationService.ts
│   │   └── storageService.ts
│   ├── context/                # Context providers
│   │   ├── WeatherContext.tsx
│   │   └── PreferencesContext.tsx
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utilidades
│   ├── theme/                  # Tema y estilos globales
│   ├── App.tsx
│   └── main.tsx
├── .env.example                # Variables de entorno de ejemplo
├── vite.config.ts              # Configuración de Vite
└── package.json
```

## 🚀 Deployment

### GitHub Pages (Automático)

El proyecto está configurado para deployment automático con GitHub Actions:

1. **Habilita GitHub Pages** en tu repositorio:
   - Ve a Settings > Pages
   - Source: GitHub Actions

2. **Push a la rama main**:

```bash
git push origin main
```

El workflow de GitHub Actions se ejecutará automáticamente y desplegará la aplicación.

### Deployment Manual

```bash
npm run deploy
```

Este comando construye el proyecto y lo publica en la rama `gh-pages`.

## 🎨 Personalización

### Tema

Edita `src/theme/theme.ts` para personalizar colores, espaciado y tipografía:

```typescript
export const theme = {
  colors: {
    primary: '#2196F3',
    secondary: '#FFC107',
    // ...
  },
  // ...
};
```

### Ciudad por Defecto

Configura la ciudad por defecto en `.env`:

```env
VITE_DEFAULT_CITY=Madrid
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Desarrollo

- Escribe tests antes de implementar features (TDD)
- Mantén la cobertura de código > 80%
- Usa TypeScript estricto
- Sigue las convenciones de styled-components
- Asegura que todos los tests pasen antes de hacer commit

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

Tu Nombre - [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [Open-Meteo](https://open-meteo.com/) por su API gratuita de datos climáticos
- [Chart.js](https://www.chartjs.org/) por la librería de gráficos
- [styled-components](https://styled-components.com/) por el sistema de estilos

## 📸 Screenshots

### Dashboard Principal
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+View)

### Comparación de Ciudades
![Comparison](https://via.placeholder.com/800x400?text=City+Comparison)

### Gráficos Interactivos
![Charts](https://via.placeholder.com/800x400?text=Interactive+Charts)

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!
