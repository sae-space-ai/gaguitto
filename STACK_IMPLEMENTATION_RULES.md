# STACK TECNOLÓGICO — REGLAS DE IMPLEMENTACIÓN

**Fecha:** 2026-01-XX  
**Estado:** ✅ Implementado según STACK_GAP_ANALYSIS

---

## 📊 STACK ACTUAL

### Frontend
- **React** 18.2.0
- **TypeScript** 5.7.0 (strict mode)
- **Tailwind CSS** 4.1.7
- **Vite** 6.3.5
- **React Router** 6.8.0
- **Framer Motion** 11.16.1
- **Lucide React** 0.294.0 (iconos)
- **Recharts** 2.10.0 (gráficos)

### Matemáticas y Finanzas
- **decimal.js** 10.6.0 ✅ **OBLIGATORIO para cálculos financieros**
- **date-fns** 2.30.0

### Backend y Base de Datos
- **@supabase/supabase-js** 2.98.0
  - Proporciona: API REST + PostgreSQL + Auth + Storage
  - **NO se instalará:** fastify, pg, Prisma (Supabase ya lo cubre)

### Validación
- **zod** ✅ **RECIENTEMENTE INSTALADO**
  - Validación runtime de schemas
  - CRÍTICO para seguridad en fronteras

### Generación de Informes
- **pdfkit** ✅ **RECIENTEMENTE INSTALADO**
  - Generación programática de PDF
- **docx** ✅ **RECIENTEMENTE INSTALADO**
  - Generación de documentos Word

### Testing
- **vitest** 5.0.3

### Utilidades
- **uuid** 9.0.1

---

## 🔒 REGLAS OBLIGATORIAS

### 1. PRECISIÓN FINANCIERA

```typescript
// ✅ CORRECTO: Usar decimal.js
import Decimal from 'decimal.js';

const price = new Decimal('19.99');
const quantity = new Decimal('3');
const total = price.times(quantity); // 59.97 (exacto)

// ❌ INCORRECTO: Usar Number
const price = 19.99;
const quantity = 3;
const total = price * quantity; // 59.970000000000006 (error de punto flotante)
```

**Regla:** TODOS los cálculos monetarios DEBEN usar `decimal.js`. NUNCA `Number` para dinero.

**Razón:** `0.1 + 0.2 = 0.30000000000000004` en JavaScript nativo. En peritaje económico, esto es inaceptable.

### 2. VALIDACIÓN RUNTIME

```typescript
// ✅ CORRECTO: Validar con zod
import { validateDCFInput } from './validation/schemas';

const result = validateDCFInput(inputData);
if (!result.success) {
  console.error('Input inválido:', result.errors);
  return;
}
// Ahora puedo usar result.data con confianza
```

**Regla:** Todo input externo (APIs, archivos, LLM, fuentes) DEBE validarse con zod antes de procesarse.

**Razón:** "Todo input procedente de frontend, archivos, APIs externas o LLM se considera no confiable hasta validarse."

### 3. FECHAS Y ZONAS HORARIAS

```typescript
// ✅ CORRECTO: Usar formato ISO 8601 con zona horaria explícita
const valuationDate = '2024-01-15T00:00:00Z'; // UTC explícito
const contractDate = '2023-06-20'; // Solo fecha, sin tiempo

// ❌ INCORRECTO: Usar Date sin zona horaria
const date = new Date('2024-01-15'); // Puede variar según zona horaria del servidor
```

**Regla:** Las fechas contractuales y `valuation_date` NO deben reinterpretarse silenciosamente por timezone.

### 4. IDENTIFICADORES

```typescript
// ✅ CORRECTO: Separar IDs internos de externos
const work = {
  workId: 'work-123-abc', // ID interno (UUID)
  externalIds: {
    asin: 'B0GPND5WZL', // Amazon ASIN
    isbn13: '978-3-16-148410-0', // ISBN
    audiusTrackId: 'https://audius.co/...', // Audius permalink
  }
};
```

**Regla:** Los external IDs de Amazon, Audius u otras fuentes permanecen SEPARADOS de los IDs internos.

### 5. ORIGEN DE DATOS

```typescript
// ✅ CORRECTO: Marcar origen de cada dato
const observation = {
  dataOrigin: 'PUBLIC_SOURCE', // o 'MOCK', 'FIXTURE', 'USER_PROVIDED', etc.
  sourceId: 'SOURCE_AMAZON_B0FNJ5QZL7',
  observedAt: '2026-01-XX',
  // ...
};
```

**Regla:** Cada dato debe tener `dataOrigin` claro. MOCK y FIXTURE NUNCA pueden entrar en inventario pericial real.

### 6. HASH ≠ AUTORIZIDAD

```typescript
// ✅ CORRECTO: El hash demuestra integridad, NO autoría
const hash = await computeDocumentHash(documentContent);
// hash demuestra que el archivo no ha sido alterado
// hash NO demuestra quién creó el archivo
// hash NO demuestra quién es el titular de derechos
```

**Regla:** Un hash SHA-256 acredita integridad/identidad del archivo comparado, NO autoría, titularidad, fecha de creación ni propiedad intelectual.

### 7. SCORE ≠ VALORACIÓN

```typescript
// ✅ CORRECTO: El score es herramienta analítica
const comparable = {
  similarityScore: 85, // 0-100, herramienta para ordenar
  // NO es una valoración monetaria
  // NO es prueba de comparabilidad jurídica
};
```

**Regla:** Un score 0-100 es una herramienta analítica, NO una medida monetaria ni prueba de comparabilidad jurídica.

### 8. SIMULACIÓN ≠ PREDICCIÓN

```typescript
// ✅ CORRECTO: Etiquetar como simulación
const scenario = {
  type: 'SIMULATION',
  description: 'Escenario hipotético basado en supuestos',
  // NO es una predicción cierta
  // NO es un valor acreditado
};
```

**Regla:** Una simulación NO es predicción cierta. Debe etiquetarse claramente como simulación/hipótesis.

---

## 🚫 LO QUE NO SE DEBE HACER

### ❌ NO instalar dependencias innecesarias

```bash
# ❌ NO hacer esto:
npm install fastify  # Supabase ya es backend
npm install pg       # Supabase ya tiene PostgreSQL
npm install prisma   # Supabase ya tiene ORM
npm install bcrypt   # Supabase Auth ya maneja passwords
npm install jose     # Supabase Auth ya maneja JWT
```

### ❌ NO usar Number para dinero

```typescript
// ❌ INCORRECTO
const price = 19.99;
const total = price * 3; // Error de punto flotante

// ✅ CORRECTO
const price = new Decimal('19.99');
const total = price.times(3); // Exacto
```

### ❌ NO confiar en inputs sin validar

```typescript
// ❌ INCORRECTO
function processAPIResponse(data: any) {
  return data.price * data.quantity; // ¿Y si price es undefined?
}

// ✅ CORRECTO
import { validateWithSchema, PriceQuantitySchema } from './validation';

function processAPIResponse(data: unknown) {
  const result = validateWithSchema(PriceQuantitySchema, data);
  if (!result.success) throw new Error('Input inválido');
  return new Decimal(result.data.price).times(result.data.quantity);
}
```

### ❌ NO confundir disponibilidad con consumo

```typescript
// ❌ INCORRECTO
// "Disponible en Amazon ES" → "Consumido en España"
// "10,000 plays en Audius" → "10,000 personas escucharon"
// "Precio €2.69" → "Ingreso €2.69"

// ✅ CORRECTO
// "Disponible en Amazon ES" → "DISPONIBLE EN AMAZON ES"
// "10,000 plays" → "10,000 PLAYS OBSERVADOS, TERRITORIO DESCONOCIDO"
// "Precio €2.69" → "PRECIO DE LISTADO €2.69, NO ES INGRESO"
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Para cada nuevo módulo:

- [ ] ¿Usa `decimal.js` para cálculos financieros?
- [ ] ¿Valida inputs con `zod` en fronteras?
- [ ] ¿Marca `dataOrigin` en cada dato?
- [ ] ¿Separa IDs internos de external IDs?
- [ ] ¿Usa fechas ISO 8601 con zona horaria explícita?
- [ ] ¿Etiqueta simulaciones como simulaciones?
- [ ] ¿No confunde score con valoración?
- [ ] ¿No confunde hash con autoridad?
- [ ] ¿No confunde disponibilidad con consumo?
- [ ] ¿No confunde precio con ingreso?

### Para cada nueva dependencia:

- [ ] ¿Existe ya una tecnología equivalente funcional?
- [ ] ¿Es estrictamente necesaria?
- [ ] ¿Está mantenida activamente?
- [ ] ¿Es compatible con el stack existente?
- [ ] ¿Tiene licencia compatible?
- [ ] ¿Aumenta superficie de ataque innecesariamente?

---

## 📚 RECURSOS

### decimal.js
- Documentación: https://mikemcl.github.io/decimal.js/
- Uso en PERITO IP: Todos los motores de Fase 2

### zod
- Documentación: https://zod.dev/
- Uso en PERITO IP: `src/validation/schemas.ts`

### Supabase
- Documentación: https://supabase.com/docs
- Uso en PERITO IP: Backend, DB, Auth, Storage

### pdfkit
- Documentación: https://pdfkit.org/
- Uso en PERITO IP: Generación de informes PDF (pendiente)

### docx
- Documentación: https://docx.js.org/
- Uso en PERITO IP: Generación de informes DOCX (pendiente)

---

## 🎯 CRITERIO DE FINALIZACIÓN

El stack está correctamente implementado cuando:

- ✅ decimal.js se usa en TODOS los cálculos financieros
- ✅ zod valida TODAS las fronteras críticas
- ✅ Supabase maneja backend, DB, auth y storage
- ✅ pdfkit/docx generan informes periciales
- ✅ NO se han instalado dependencias innecesarias
- ✅ NO se ha roto nada funcional existente
- ✅ Todos los desarrolladores conocen y siguen las reglas

---

**Estado actual:** ✅ Stack implementado según STACK_GAP_ANALYSIS. Faltan: integración de pdfkit/docx en generación de informes, y aplicación de validación zod en todas las fronteras.
