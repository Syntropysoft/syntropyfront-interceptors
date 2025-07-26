/**
 * ReduxInterceptor - Interceptor para Redux stores
 * Intercepta acciones y cambios de estado de Redux
 * Usa la API segura de SyntropyFront
 */
function ReduxInterceptor$1() {
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

/**
 * VuexInterceptor - Interceptor para Vuex stores
 * Intercepta mutaciones y cambios de estado de Vuex
 * Usa la API segura de SyntropyFront
 */
function VuexInterceptor$1() {
    let originalCommit = null;
    let store = null;
    let unsubscribe = null;
    let api = null;

    return {
        name: 'vuex',
        
        /**
         * Inicializa el interceptor
         * @param {Object} apiInstance - API segura de SyntropyFront
         */
        init(apiInstance) {
            api = apiInstance;
            console.log('SyntropyFront: Vuex interceptor inicializado (esperando store)');
            
            // Inicialización "perezosa" con retry
            this.findStoreWithRetry();
        },

        /**
         * Busca store con retry automático
         * @param {number} retries - Número de intentos restantes
         * @param {number} delay - Delay entre intentos en ms
         */
        findStoreWithRetry(retries = 5, delay = 500) {
            const foundStore = this.findVuexStore();
            
            if (foundStore) {
                this.setStore(foundStore);
                console.log('SyntropyFront: Store de Vuex encontrado y configurado automáticamente.');
            } else if (retries > 0) {
                console.log(`SyntropyFront: Buscando store de Vuex... (${retries} intentos restantes)`);
                setTimeout(() => this.findStoreWithRetry(retries - 1, delay), delay);
            } else {
                console.warn('SyntropyFront: No se encontró store de Vuex después de varios intentos. Usa setStore() para configurarlo manualmente.');
            }
        },

        /**
         * Configura el store de Vuex
         * @param {Object} vuexStore - Store de Vuex
         */
        setStore(vuexStore) {
            if (!api) {
                console.warn('SyntropyFront: Vuex interceptor no inicializado');
                return;
            }

            if (!vuexStore) {
                console.warn('SyntropyFront: Store de Vuex no válido');
                return;
            }

            // Verificar que sea un store válido
            if (typeof vuexStore.commit !== 'function' || typeof vuexStore.subscribe !== 'function') {
                console.warn('SyntropyFront: Store de Vuex no tiene métodos requeridos (commit, subscribe)');
                return;
            }

            try {
                store = vuexStore;

                // Interceptar commit
                originalCommit = store.commit;
                store.commit = (type, payload, options) => {
                    try {
                        // Agregar breadcrumb antes del commit
                        api.addBreadcrumb('vuex', `Vuex Mutation: ${type}`, {
                            mutation: { type, payload },
                            state: store.state
                        });

                        // Ejecutar commit original
                        const result = originalCommit.call(store, type, payload, options);

                        // Agregar breadcrumb después del commit
                        api.addBreadcrumb('vuex', `Vuex State Updated`, {
                            mutationType: type,
                            newState: store.state
                        });

                        return result;
                    } catch (error) {
                        // Si hay error en el commit, enviarlo
                        api.sendError({
                            type: 'vuex_commit_error',
                            error: {
                                message: error.message,
                                stack: error.stack
                            },
                            mutation: { type, payload }
                        });
                        throw error;
                    }
                };

                // Suscribirse a cambios de estado
                unsubscribe = store.subscribe((mutation, state) => {
                    // Los breadcrumbs ya se agregaron en commit
                    // Aquí podríamos agregar lógica adicional si es necesario
                });

                console.log('SyntropyFront: Store de Vuex configurado');
            } catch (error) {
                console.error('SyntropyFront: Error configurando store de Vuex:', error);
            }
        },

        /**
         * Busca automáticamente el store (método de conveniencia)
         * @returns {boolean} True si encontró y configuró un store
         */
        autoFindStore() {
            if (!api) {
                console.warn('SyntropyFront: Vuex interceptor no inicializado');
                return false;
            }

            let foundStore = null;

            // Buscar en ubicaciones comunes
            if (window.$store) {
                foundStore = window.$store;
            } else if (window.store) {
                foundStore = window.store;
            } else if (window.vuexStore) {
                foundStore = window.vuexStore;
            }

            if (foundStore) {
                this.setStore(foundStore);
                return true;
            }

            console.warn('SyntropyFront: No se encontró store de Vuex automáticamente');
            return false;
        },

        /**
         * Obtiene información del interceptor
         * @returns {Object} Información del interceptor
         */
        getInfo() {
            return {
                name: 'vuex',
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
                // Restaurar commit original
                if (store && originalCommit) {
                    store.commit = originalCommit;
                }

                // Desuscribirse de cambios
                if (unsubscribe) {
                    unsubscribe();
                }

                // Limpiar referencias
                store = null;
                originalCommit = null;
                unsubscribe = null;
                api = null;

                console.log('SyntropyFront: Vuex interceptor destruido');
            } catch (error) {
                console.error('SyntropyFront: Error destruyendo Vuex interceptor:', error);
            }
        }
    };
}

/**
 * @syntropyfront/interceptors
 * Official interceptors for SyntropyFront
 * 
 * This package provides framework-specific interceptors that can be used
 * with the core SyntropyFront library via the injectCustomInterceptor() method.
 */


// Export all interceptors as a collection
const interceptors = {
  redux: ReduxInterceptor,
  vuex: VuexInterceptor
};

export { ReduxInterceptor$1 as ReduxInterceptor, VuexInterceptor$1 as VuexInterceptor, interceptors as default, interceptors };
//# sourceMappingURL=index.js.map
