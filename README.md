# DolarMood CR

Un dashboard vacilon sobre el tipo de cambio `USD -> CRC`, hecho solo con frontend y bastante drama visual.

La idea es simple: agarrar el precio del dolar, ver si la vara sube, baja o se queda tiesa, y convertir eso en una experiencia medio meme con una mascotilla animada en `canvas` que reacciona como si le estuvieran cobrando el alquiler en tiempo real.

## Que tiene de pichudo

- `Astro` para mantenerlo rapido y liviano
- `TypeScript` para que no andemos adivinando cosas
- `Tailwind CSS` para iterar el look sin hacer papelones
- `HTML Canvas` para la mascotilla dramatica
- datos en vivo desde una API publica
- fallback local por si la API decide jalarse una torta
- botones demo para forzar crisis, bajon o calma sospechosa

## El concepto

Esto no quiere ser una app bancaria seria.

Quiere ser una mini parodia fintech a la tica:

- si el dolar sube: el personaje entra en modo novela, suda, vibra y se pone intenso
- si baja: se relaja, celebra y se siente como viernes
- si se queda estable: da vibra de "todo demasiado tranquilo... que raro"

## Stack

- `Astro`
- `TypeScript`
- `Tailwind CSS`
- `Canvas API`
- `localStorage` para guardar historial ligero del navegador

## Como correrlo

```bash
npm install
npm run dev
```

Luego abrilo en:

```text
http://localhost:4321
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Estructura

```text
src/
  components/   componentes visuales
  layouts/      layout base
  lib/          utilidades, mood logic, datos y canvas
  pages/        paginas Astro
  styles/       estilos globales
```

## De donde salen los datos

La app intenta traer el tipo de cambio en vivo desde `open.er-api.com`.

Como esto sigue siendo frontend-only:

- no hay backend
- no hay base de datos
- no hay auth
- no hay storage del lado del servidor

El trend se calcula comparando la ultima lectura guardada en el navegador contra la lectura actual.

O sea: pura brujeria liviana del lado cliente.

## La mascotilla

La estrella del show vive en:

- [`src/components/CanvasHero.astro`](./src/components/CanvasHero.astro)
- [`src/lib/canvas/hero-scene.ts`](./src/lib/canvas/hero-scene.ts)

Todo se dibuja con primitivas de canvas:

- ojos
- boca
- sudor
- flechas
- confetti
- vibracion
- dramatismo innecesario

## Botones demo

Para probar moods sin esperar que el mercado coopere:

- `Simular crisis 😈`
- `Simular bajon 😌`
- `Simular calma sospechosa 👀`

Ideal para ajustar animaciones y copy sin depender del dato real.

## Objetivo del proyecto

Hacer algo que se vea:

- divertido
- bien cuidado
- facil de entender
- suficientemente pulido para portfolio, post o demo

Sin sobreingenieria. Sin humo. Sin backend por jugar de salsa.

## Pendientes vacilones

- refinar el sparkline para que tenga mas glow y mas actitud
- meter mas estados visuales segun la intensidad del cambio
- conectar una fuente historica mas fina para trends mejores
- agregar un README con screenshots despues de tomar capturas decentes

## Autor

Hecho por Miguel, con vibes ticas, un poco de caos controlado y demasiado respeto por el poder comico del tipo de cambio.
