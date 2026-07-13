# Design checklist (customer-facing)

Usá esta lista al revisar un modelo o al explicar cómo diseñar para FDM. Lenguaje simple; los números son puntos de partida, no promesas de contrato.

## Antes de mandar a imprimir

1. **¿Para qué es la pieza?** Decoración, uso mecánico liviano, o flexible.
2. **¿Dónde vive?** Interior seco, sol, calor (auto, cerca de motor, etc.).
3. **¿Tiene archivo?** STL / 3MF / OBJ; si no, se puede cotizar diseño o buscar modelo.
4. **Tamaño** — piezas muy grandes pueden partirse en partes o necesitar más soporte.

## Geometría amigable

- Paredes con cuerpo (evitar láminas de menos de ~1–1,2 mm salvo que se acuerde).
- Chaflanes o redondeos en esquinas internas (menos estrés).
- Orificios verticales suelen salir más redondos que horizontales.
- Texto en relieve: más alto/ancho = más legible.

## Ensambles

| Tipo | Holgura orientativa por lado | Uso |
|------|------------------------------|-----|
| Holgado | 0,3–0,5 mm | Desliza o gira |
| A presión | 0,1–0,2 mm | Queda firme |
| Pegado | ~0,1–0,2 mm | Unión con adhesivo |

Avisar: la primera prueba de encaje a veces necesita un ajuste menor.

## Orientación (explicación simple)

Imaginá las capas como láminas apiladas. La pieza es más fuerte *a lo largo* de las capas que *tirando para separarlas*. Orientá según cómo se va a cargar.

## Qué no prometer

- Acabado tipo inyección sin postprocesado
- Piezas transparentes ópticas en FDM
- Resistencia al calor alta con PLA
- Flexibilidad alta sin TPU (u otro flexible)

## Cuándo derivar al taller

- Fallas de máquina, atascos, calibración
- Materiales especiales (nylon, fibra de carbono, resina)
- Requisitos de seguridad / certificación
