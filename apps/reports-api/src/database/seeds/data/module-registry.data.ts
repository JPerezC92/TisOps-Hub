/**
 * Module Registry Seed Data
 * Maps source module values to custom display values with application indicator
 */

export interface ModuleMapping {
  sourceValue: string;
  displayValue: string;
  application: 'CD' | 'FFVV' | 'SB' | 'UNETE';
}

export const moduleMappings: ModuleMapping[] = [
  // CD (Catalog/Digital) modules
  {
    sourceValue: 'CD Catalog',
    displayValue: 'Catalog',
    application: 'CD',
  },
  {
    sourceValue: 'CD Catalogos Personalizados',
    displayValue: 'Custom Catalogs',
    application: 'CD',
  },
  {
    sourceValue: 'CD Checkout Entrega Inmediata',
    displayValue: 'Checkout Immediate Delivery',
    application: 'CD',
  },
  {
    sourceValue: 'CD Checkout prepedidos',
    displayValue: 'Checkout Pre-orders',
    application: 'CD',
  },
  {
    sourceValue: 'CD Login',
    displayValue: 'Login',
    application: 'CD',
  },
  {
    sourceValue: 'CD Pdp',
    displayValue: 'PDP',
    application: 'CD',
  },
  {
    sourceValue: 'CD Search',
    displayValue: 'Search',
    application: 'CD',
  },

  // FFVV modules
  {
    sourceValue: 'FFVV Avance de facturación',
    displayValue: 'Billing Progress',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Bolsa de pedidos',
    displayValue: 'Order Bag',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Botón ciclo de nuevas',
    displayValue: 'New Cycle Button',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Botón retención y capi',
    displayValue: 'Retention & Capi Button',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Botón venta pedido pnmp',
    displayValue: 'PNMP Order Sale Button',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Buscar consultora',
    displayValue: 'Search Consultant',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Cobranzas',
    displayValue: 'Collections',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Consulta postulante',
    displayValue: 'Applicant Query',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Data Report (reportes de campaña)',
    displayValue: 'Data Report',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Listado socias',
    displayValue: 'Partners List',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Login (ingreso al app)',
    displayValue: 'Login',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Perfil consultora',
    displayValue: 'Consultant Profile',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Perfil socia',
    displayValue: 'Partner Profile',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Problemas de data',
    displayValue: 'Data Issues',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Proyección de campaña',
    displayValue: 'Campaign Projection',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Reporte Semáforo',
    displayValue: 'Traffic Light Report',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Ruta de desarrollo',
    displayValue: 'Development Path',
    application: 'FFVV',
  },
  {
    sourceValue: 'FFVV Unete',
    displayValue: 'Unete',
    application: 'FFVV',
  },

  // SB (Somos Belcorp) modules
  {
    sourceValue: 'SB2 Actualizar Matriz',
    displayValue: 'Update Matrix',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Bonificaciones',
    displayValue: 'Bonuses',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Cambios y devoluciones',
    displayValue: 'Changes & Returns',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Carrito Sugerido',
    displayValue: 'Suggested Cart',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Catálogos y Revistas',
    displayValue: 'Catalogs & Magazines',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 ChatBot',
    displayValue: 'ChatBot',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Descarga de Pedidos',
    displayValue: 'Order Download',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Entrega instantanea',
    displayValue: 'Instant Delivery',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Festivales',
    displayValue: 'Festivals',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Gana Refiriendo',
    displayValue: 'Earn by Referring',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Liquidaciones',
    displayValue: 'Clearance',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Login (cuentas de usuario)',
    displayValue: 'Login',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Material de Redes Sociales',
    displayValue: 'Social Media Material',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Matriz/Estrategia',
    displayValue: 'Matrix/Strategy',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Mi Tienda Online',
    displayValue: 'My Online Store',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Multipedido',
    displayValue: 'Multi-Order',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 New Home',
    displayValue: 'New Home',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Oferta Final',
    displayValue: 'Final Offer',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Ofertas Gana+',
    displayValue: 'Gana+ Offers',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Otros',
    displayValue: 'Others',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Pago de Contado',
    displayValue: 'Cash Payment',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Pago en Línea',
    displayValue: 'Online Payment',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Pase de Pedidos',
    displayValue: 'Order Placement',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Pedidos de Campaña',
    displayValue: 'Campaign Orders',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Productos Sugeridos',
    displayValue: 'Suggested Products',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Programa de Nuevas',
    displayValue: 'New Consultants Program',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Reactivación de Pedidos',
    displayValue: 'Order Reactivation',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Reporte Pedidos Digitados',
    displayValue: 'Entered Orders Report',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Reserva de Pedidos',
    displayValue: 'Order Reservation',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 RxP-Tombola',
    displayValue: 'RxP-Raffle',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 SAC/ Contenido',
    displayValue: 'SAC/Content',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Tracking de Pedidos',
    displayValue: 'Order Tracking',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 VaIidación Automática',
    displayValue: 'Automatic Validation',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Zona de Todas Ofertas',
    displayValue: 'All Offers Zone',
    application: 'SB',
  },
  {
    sourceValue: 'SB2 Back order',
    displayValue: 'Back Order',
    application: 'SB',
  },

  // UNETE modules
  {
    sourceValue: 'Unete Actualizar Información',
    displayValue: 'Actualizar Información',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Aprobación FFVV',
    displayValue: 'Aprobación FFVV',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Belcorp Validación',
    displayValue: 'Belcorp Validación',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Buro',
    displayValue: 'Buro',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Cambio de Fuente Ingreso',
    displayValue: 'Cambio de Fuente Ingreso',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Carga de documentos',
    displayValue: 'Carga de documentos',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Generación de código',
    displayValue: 'Generación de código',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Gestiona Postulante',
    displayValue: 'Gestiona Postulante',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Primer Pedido Aprobado',
    displayValue: 'Primer Pedido Aprobado',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Sesion Modo Prueba',
    displayValue: 'Sesion Modo Prueba',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Unete Validación',
    displayValue: 'Unete Validación',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Validación Identidad',
    displayValue: 'Validación Identidad',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Validación Pin',
    displayValue: 'Validación Pin',
    application: 'UNETE',
  },
  {
    sourceValue: 'Unete Zonificación',
    displayValue: 'Zonificación',
    application: 'UNETE',
  },
];
