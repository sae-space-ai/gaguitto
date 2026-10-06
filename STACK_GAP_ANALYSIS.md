# STACK GAP ANALYSIS — PERITO IP

**Fecha:** 2026-01-XX  
**Propósito:** Identificar gaps reales entre stack objetivo y stack existente SIN destruir lo funcional

---

## 📊 STACK EXISTENTE (Inspección de package.json)

### ✅ Frontend
- **react** 18.2.0 ✓
- **typescript** 5.7.0 ✓
- **tailwindcss** 4.1.7 ✓
- **vite** 6.3.5 ✓
- **react-router-dom** 6.8.0 ✓
- **framer-motion** 11.16.1 ✓
- **lucide-react** 0.294.0 ✓
- **recharts** 2.10.0 ✓ (gráficos para observatorio)

### ✅ Matemáticas y Finanzas
- **decimal.js** 10.6.0 ✓ (CRÍTICO - ya instalado)
- **date-fns** 2.30.0 ✓

### ✅ Backend y Base de Datos
- **@supabase/supabase-js** 2.98.0 ✓
  - Proporciona: Backend API + PostgreSQL + Autenticación + Storage
  - **NO NECESITA:** fastify, pg, Prisma, bcrypt, jose

### ✅ Testing
- **vitest** 5.0.3 ✓

### ✅ Utilidades
- **uuid** 9.0.1 ✓

---

## 🔍 GAP ANALYSIS

### ✅ EXISTING (Ya instalado y funcional)

| Componente | Tecnología Actual | Estado |
|------------|------------------|--------|
| Frontend | React 18 + TypeScript 5 + Tailwind 4 | ✅ Completo |
| Backend API | Supabase (auto-generated REST/GraphQL) | ✅ Completo |
| Base de Datos | Supabase PostgreSQL | ✅ Completo |
| Autenticación | Supabase Auth | ✅ Completo |
| Motor Matemático | decimal.js 10.6.0 | ✅ Completo |
| Gráficos | recharts 2.10.0 | ✅ Completo |
| Testing | vitest 5.0.3 | ✅ Completo |
| Fechas | date-fns 2.30.0 | ✅ Completo |
| IDs | uuid 9.0.1 | ✅ Completo |

### ⚠️ MISSING (Falta realmente necesario)

| Componente | Tecnología Propuesta | Justificación | Prioridad |
|------------|---------------------|---------------|-----------|
| Validación Runtime | **zod** | Schemas runtime para APIs, archivos, inputs LLM | 🔴 CRÍTICA |
| Generación PDF | **pdfkit** | Informes periciales exportables | 🟡 ALTA |
| Generación DOCX | **docx** | Informes editables para revisión | 🟡 ALTA |

### ✅ EQUIVALENT (Ya existe equivalente funcional)

| Requerimiento | Solución Existente | Acción |
|---------------|-------------------|--------|
| Backend API | Supabase | ✅ NO instalar fastify |
| PostgreSQL | Supabase PostgreSQL | ✅ NO instalar pg |
| ORM | Supabase client | ✅ NO instalar Prisma |
| Auth/Passwords | Supabase Auth | ✅ NO instalar bcrypt |
| JWT | Supabase Auth | ✅ NO instalar jose |
| Almacenamiento | Supabase Storage | ✅ NO instalar S3/MinIO |

### ✅ NOT_NEEDED (No necesario en este momento)

| Componente | Razón |
|------------|-------|
| ioredis (Redis) | No hay evidencia de necesidad de cache |
| puppeteer | pdfkit es suficiente para PDF |
| Sentry | Observabilidad opcional, no crítica |
| Docker Compose | No hay backend local que containerizar |
| GitHub Actions | CI/CD puede configurarse después |

---

## 🎯 DECISIÓN DE IMPLEMENTACIÓN

### INSTALAR (Solo lo estrictamente necesario)

```bash
# Validación runtime (CRÍTICO para seguridad)
npm install zod

# Generación de informes (ALTA prioridad)
npm install pdfkit docx
npm install --save-dev @types/pdfkit
```

### NO INSTALAR (Ya existe equivalente)

- ❌ fastify (Supabase ya es backend)
- ❌ pg (Supabase ya tiene PostgreSQL)
- ❌ Prisma (Supabase ya tiene ORM)
- ❌ bcrypt (Supabase Auth ya maneja passwords)
- ❌ jose (Supabase Auth ya maneja JWT)
- ❌ ioredis (no hay necesidad demostrada de cache)
- ❌ puppeteer (pdfkit es suficiente)

---

## 🔒 REGLAS DE IMPLEMENTACIÓN

### 1. decimal.js es OBLIGATORIO para finanzas
- ✅ Ya instalado
- ✅ Todos los motores de Fase 2 lo usan
- ❌ NUNCA usar Number para cálculos monetarios

### 2. zod es OBLIGATORIO para validación
- ❌ No instalado todavía
- 🔴 CRÍTICO para seguridad en fronteras (APIs, archivos, LLM)
- 📋 Implementar en:
  - Inputs de APIs
  - Archivos subidos
  - Respuestas de LLM
  - Datos de fuentes externas

### 3. Supabase reemplaza backend tradicional
- ✅ Ya proporciona: API + DB + Auth + Storage
- ❌ NO duplicar con fastify/pg/Prisma
- 📋 Usar Supabase client para:
  - Queries PostgreSQL
  - Autenticación
  - Storage de documentos
  - Real-time subscriptions

### 4. pdfkit + docx para informes
- ❌ No instalados todavía
- 📋 Implementar en Fase de Informes:
  - PDF: informes periciales finales
  - DOCX: borradores editables para revisión

---

## 📋 PLAN DE ACCIÓN

### Fase Inmediata (Esta sesión)
1. ✅ Instalar **zod** (validación runtime)
2. ✅ Instalar **pdfkit** + **docx** (generación informes)
3. ✅ Crear schemas de validación para:
   - Inputs de motores
   - Datos de fuentes externas
   - Respuestas de LLM
4. ✅ Documentar uso de decimal.js en todos los cálculos

### Fase Posterior (Informes)
5. Implementar generador PDF con pdfkit
6. Implementar generador DOCX con docx
7. Integrar con sistema de plantillas

### NO HACER
- ❌ No instalar fastify (Supabase ya es backend)
- ❌ No instalar pg (Supabase ya tiene PostgreSQL)
- ❌ No instalar Prisma (Supabase ya tiene ORM)
- ❌ No reemplazar decimal.js (ya funciona)
- ❌ No reemplazar recharts (ya funciona)

---

## ✅ CRITERIO DE FINALIZACIÓN

El stack estará correctamente implementado cuando:
- ✅ decimal.js se use en TODOS los cálculos financieros
- ✅ zod valide TODAS las fronteras críticas
- ✅ Supabase maneje backend, DB, auth y storage
- ✅ pdfkit/docx generen informes periciales
- ✅ NO se hayan instalado dependencias innecesarias
- ✅ NO se haya roto nada funcional existente

---

**Conclusión:** El stack está mayoritariamente completo. Solo faltan zod (validación) y pdfkit/docx (informes). NO instalar backend tradicional porque Supabase ya lo proporciona.
