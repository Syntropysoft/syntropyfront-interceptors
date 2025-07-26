/**
 * ReduxInterceptor - Interceptor para Redux stores
 * Intercepta acciones y cambios de estado de Redux
 * Usa la API segura de SyntropyFront
 */
export default function ReduxInterceptor() {
    let originalDispatch = null;
    let store = null;
    let unsubscribe = null;
    let api = null;

    return {
        name: 'redux',
        
        /**
         * Inicializa el interceptor
         * @param {Object} apiInstance - API segura de SyntropyFront
         */
        init(apiInstance) {
            api = apiInstance;
            console.log('SyntropyFront: Redux interceptor inicializado (esperando store)');
            
            // Inicialización "perezosa" con retry
            this.findStoreWithRetry();
        },

        /**
         * Busca store con retry automático
         * @param {number} retries - Número de intentos restantes
         * @param {number} delay - Delay entre intentos en ms
         */
        findStoreWithRetry(retries = 5, delay = 500) {
            const foundStore = this.findReduxStore();
            
            if (foundStore) {
                this.setStore(foundStore);
                console.log('SyntropyFront: Store de Redux encontrado y configurado automáticamente.');
            } else if (retries > 0) {
                console.log(`SyntropyFront: Buscando store de Redux... (${retries} intentos restantes)`);
                setTimeout(() => this.findStoreWithRetry(retries - 1, delay), delay);
            } else {
                console.warn('SyntropyFront: No se encontró store de Redux después de varios intentos. Usa setStore() para configurarlo manualmente.');
            }
        },

        /**
         * Configura el store de Redux
         * @param {Object} reduxStore - Store de Redux
         */
        setStore(reduxStore) {
            if (!api) {
                console.warn('SyntropyFront: Redux interceptor no inicializado');
                return;
            }

            if (!reduxStore) {
                console.warn('SyntropyFront: Store de Redux no válido');
                return;
            }

            // Verificar que sea un store válido
            if (typeof reduxStore.getState !== 'function' || typeof reduxStore.subscribe !== 'function') {
                console.warn('SyntropyFront: Store de Redux no tiene métodos requeridos (getState, subscribe)');
                return;
            }

            try {
                store = reduxStore;

                // Interceptar dispatch
                originalDispatch = store.dispatch;
                store.dispatch = (action) => {
                    try {
                        // Agregar breadcrumb antes del dispatch
                        api.addBreadcrumb('redux', `Redux Action: ${action.type}`, {
                            action: action,
                            state: store.getState()
                        });

                        // Ejecutar dispatch original
                        const result = originalDispatch.call(store, action);

                        // Agregar breadcrumb después del dispatch
                        api.addBreadcrumb('redux', `Redux State Updated`, {
                            actionType: action.type,
                            newState: store.getState()
                        });

                        return result;
                    } catch (error) {
                        // Si hay error en el dispatch, enviarlo
                        api.sendError({
                            type: 'redux_dispatch_error',
                            error: {
                                message: error.message,
                                stack: error.stack
                            },
                            action: action
                        });
                        throw error;
                    }
                };

                // Suscribirse a cambios de estado
                unsubscribe = store.subscribe(() => {
                    // Los breadcrumbs ya se agregaron en dispatch
                    // Aquí podríamos agregar lógica adicional si es necesario
                });

                console.log('SyntropyFront: Store de Redux configurado');
            } catch (error) {
                console.error('SyntropyFront: Error configurando store de Redux:', error);
            }
        },

        /**
         * Busca automáticamente el store (método de conveniencia)
         * @returns {boolean} True si encontró y configuró un store
         */
        autoFindStore() {
            if (!api) {
                console.warn('SyntropyFront: Redux interceptor no inicializado');
                return false;
            }

            let foundStore = null;

            // Buscar en ubicaciones comunes
            if (window.reduxStore) {
                foundStore = window.reduxStore;
            } else if (window.store) {
                foundStore = window.store;
            } else if (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.connect) {
                // Intentar obtener desde Redux DevTools
                try {
                    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
                    if (devTools && devTools.getState) {
                        foundStore = devTools;
                    }
                } catch (error) {
                    console.warn('SyntropyFront: Error conectando con Redux DevTools:', error);
                }
            }

            if (foundStore) {
                this.setStore(foundStore);
                return true;
            }

            console.warn('SyntropyFront: No se encontró store de Redux automáticamente');
            return false;
        },

        /**
         * Obtiene información del interceptor
         * @returns {Object} Información del interceptor
         */
        getInfo() {
            return {
                name: 'redux',
                isInitialized: !!api,
                hasStore: !!store,
                storeType: store ? 'configured' : 'none',
                methods: ['setStore', 'autoFindStore', 'getInfo']
            };
        },

        /**
         * Destruye el interceptor
         */
        destroy() {
            try {
                // Restaurar dispatch original
                if (store && originalDispatch) {
                    store.dispatch = originalDispatch;
                }

                // Desuscribirse de cambios
                if (unsubscribe) {
                    unsubscribe();
                }

                // Limpiar referencias
                store = null;
                originalDispatch = null;
                unsubscribe = null;
                api = null;

                console.log('SyntropyFront: Redux interceptor destruido');
            } catch (error) {
                console.error('SyntropyFront: Error destruyendo Redux interceptor:', error);
            }
        }
    };
} 