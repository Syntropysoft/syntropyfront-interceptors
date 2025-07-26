# @syntropyfront/interceptors

Official interceptors for SyntropyFront - Framework-specific interceptors for React, Vue, Angular, and more.

## Installation

```bash
npm install @syntropyfront/interceptors
```

## Usage

All interceptors are used with the core `syntropylogfront` library via the `inject()` method:

```javascript
import { SyntropyFront } from 'syntropylogfront';
import { ReduxInterceptor, VuexInterceptor } from '@syntropyfront/interceptors';

// Initialize SyntropyFront
SyntropyFront.init({
    agent: {
        endpoint: 'https://api.tuapp.com/errors'
    }
});

// Inject framework-specific interceptors
SyntropyFront.inject('redux', ReduxInterceptor());
SyntropyFront.inject('vuex', VuexInterceptor());

// Configure stores explicitly (recommended)
const reduxInfo = SyntropyFront.getInterceptorInfo('redux');
if (reduxInfo && reduxInfo.setStore) {
    reduxInfo.setStore(myReduxStore);
}

const vuexInfo = SyntropyFront.getInterceptorInfo('vuex');
if (vuexInfo && vuexInfo.setStore) {
    vuexInfo.setStore(myVuexStore);
}
```

## Available Interceptors

### Redux Interceptor

Intercepts Redux store actions and state changes.

```javascript
import { ReduxInterceptor } from '@syntropyfront/interceptors';

// Inject Redux interceptor
SyntropyFront.inject('redux', ReduxInterceptor());

// Configure the store explicitly
const reduxInfo = SyntropyFront.getInterceptorInfo('redux');
if (reduxInfo && reduxInfo.setStore) {
    reduxInfo.setStore(myReduxStore);
}

// Or use auto-find (convenience method)
if (reduxInfo && reduxInfo.autoFindStore) {
    reduxInfo.autoFindStore();
}

// The interceptor will:
// - Track Redux actions
// - Monitor state changes
// - Add breadcrumbs for state mutations
```

### Vuex Interceptor

Intercepts Vuex store mutations and actions.

```javascript
import { VuexInterceptor } from '@syntropyfront/interceptors';

// Inject Vuex interceptor
SyntropyFront.inject('vuex', VuexInterceptor());

// Configure the store explicitly
const vuexInfo = SyntropyFront.getInterceptorInfo('vuex');
if (vuexInfo && vuexInfo.setStore) {
    vuexInfo.setStore(myVuexStore);
}

// Or use auto-find (convenience method)
if (vuexInfo && vuexInfo.autoFindStore) {
    vuexInfo.autoFindStore();
}

// The interceptor will:
// - Track Vuex mutations
// - Monitor actions
// - Add breadcrumbs for state changes
```

## Object Tracking with ProxyObjectTracker

For tracking any JavaScript object (not just framework stores), use the built-in **ProxyObjectTracker** from the core library:

```javascript
import { SyntropyFront } from 'syntropylogfront';

// Track any object reactively
const myObject = { name: 'test', data: [] };
const trackedObject = SyntropyFront.addProxyObject('myObject', myObject, {
    trackNested: true,
    trackArrays: true,
    maxStates: 10
});

// Every change is captured automatically
trackedObject.name = 'updated';
trackedObject.data.push('new item');
trackedObject.nested = { value: 42 };

// Get history of changes
const history = SyntropyFront.getProxyObjectHistory('myObject');
```

### Why ProxyObjectTracker is Superior:

- **✅ Reactive**: Captures changes in real-time using Proxy
- **✅ Comprehensive**: Tracks nested objects, arrays, and all property changes
- **✅ Simple API**: One method to track any object
- **✅ Framework-agnostic**: Works with any JavaScript object
- **✅ No setup required**: Just pass the object you want to track

## Why Explicit Store Configuration?

### The Problem with Auto-Discovery

Traditional interceptors automatically search for stores in global variables:

```javascript
// ❌ PROBLEM: Interceptor searches for store
if (window.reduxStore) {
    this.store = window.reduxStore;
} else if (window.store) {
    this.store = window.store;
}
```

### Why This is Problematic:

- **Mixed Responsibilities**: Interceptor does too many things
- **Less Flexible**: Can't work with custom store locations
- **Hidden Dependencies**: Not clear what the interceptor needs

## 🔄 Inicialización "Perezosa" con Retry

### El Problema del Orden de Inicialización

En aplicaciones reales, los stores se crean después del `init()`:

```javascript
// ❌ PROBLEMA: Orden incorrecto
SyntropyFront.init(); // Interceptor busca store
// ... tiempo después ...
const store = createStore(); // Store se crea tarde
```

### La Solución: Retry Automático

Los interceptores implementan inicialización "perezosa" que espera a que los stores se creen:

```javascript
// Los interceptores buscan automáticamente los stores con retry
// Redux: busca en window.reduxStore, window.store, etc.
// Vuex: busca en window.vuexStore, window.store, etc.

// Si no encuentra el store inmediatamente, reintenta 5 veces cada 500ms
console.log('SyntropyFront: Buscando store de Redux... (5 intentos restantes)');
console.log('SyntropyFront: Buscando store de Redux... (4 intentos restantes)');
// ... hasta encontrar o agotar intentos

// Si encuentra el store automáticamente
console.log('SyntropyFront: Store de Redux encontrado y configurado automáticamente.');

// Si no encuentra después de todos los intentos
console.warn('SyntropyFront: No se encontró store de Redux después de varios intentos. Usa setStore() para configurarlo manualmente.');
```

### Beneficios de la Inicialización "Perezosa":

- **✅ Plug-and-play**: No importa el orden de inicialización
- **✅ Resiliente**: Espera a que los stores se creen
- **✅ No bloqueante**: No interrumpe la inicialización de la app
- **✅ Fallback manual**: Si no encuentra automáticamente, permite configuración manual
- **Hard to Test**: Depends on global variables
- **Less Reusable**: Tied to specific conventions

### The Solution: Explicit Configuration

```javascript
// ✅ SOLUTION: User explicitly provides the store
const reduxInfo = SyntropyFront.getInterceptorInfo('redux');
reduxInfo.setStore(myReduxStore);
```

### Benefits:

- **Single Responsibility**: Interceptor only handles interception
- **More Flexible**: Works with any store location
- **Clear Dependencies**: Explicit about what's needed
- **Easy to Test**: No hidden dependencies
- **More Reusable**: Framework-agnostic

## Creating Your Own Interceptors

You can create custom interceptors for any framework or library using the secure API:

```javascript
// MyCustomInterceptor.js
export default function MyCustomInterceptor() {
  return {
    name: 'myCustom',
    
    init(api) {
      // api is a secure facade with only safe methods
      console.log('My custom interceptor initialized');
      
      // Add breadcrumbs
      api.addBreadcrumb('custom', 'My interceptor started', { data: 'example' });
      
      // Send data to backend
      api.sendError({ message: 'Custom error' });
      
      // Get context
      const context = api.getContext({ device: true });
      
      // Get timestamp
      const timestamp = api.getTimestamp();
    },
    
    destroy() {
      // Cleanup your interceptor
      console.log('My custom interceptor destroyed');
    }
  };
}

// Usage
import MyCustomInterceptor from './MyCustomInterceptor.js';
syntropyFront.injectCustomInterceptor('myCustom', MyCustomInterceptor);
```

## Secure API Reference

The interceptor receives a secure API object with these methods:

### `addBreadcrumb(category, message, data?)`
Adds a breadcrumb to the history.

### `sendError(errorPayload, context?)`
Sends an error to the backend.

### `sendBreadcrumbs(breadcrumbs)`
Sends breadcrumbs to the backend.

### `getContext(contextConfig?)`
Gets browser context data.

### `getTimestamp()`
Gets current timestamp in ISO format.

### API Information
- `api.apiVersion` - API version
- `api.availableMethods` - List of available methods

## Interceptor Configuration

Each interceptor receives a secure API object with access to safe SyntropyFront methods:

```javascript
{
  addBreadcrumb,     // Add breadcrumbs safely
  sendError,         // Send errors to backend
  sendBreadcrumbs,   // Send breadcrumbs to backend
  getContext,        // Get context data
  getTimestamp,      // Get current timestamp
  apiVersion,        // API version
  availableMethods   // List of available methods
}
```

## Security Benefits

- **No direct access** to internal components
- **Controlled API** - only safe methods exposed
- **Isolation** - interceptors can't break the library
- **Versioning** - API version tracking
- **Documentation** - clear method signatures

## Examples

See the [examples directory](../../syntropylogfront/examples/) for complete usage examples.

## Links

- 📦 [npm package](https://www.npmjs.com/package/@syntropyfront/interceptors)
- 📖 [Documentation](https://github.com/Syntropysoft/syntropyfront-interceptors)
- 🐛 [Issues](https://github.com/Syntropysoft/syntropyfront-interceptors/issues)
- 💬 [Discussions](https://github.com/Syntropysoft/syntropyfront-interceptors/discussions)
- 🔗 [Core Library](https://github.com/Syntropysoft/syntropyfront)

## License

Apache 2.0 