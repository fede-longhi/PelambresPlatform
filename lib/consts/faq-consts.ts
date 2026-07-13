export type FaqItem = {
  question: string;
  answer: string;
};

/** Public FAQ copy for customers (es-AR). Keep in sync with FAQ JSON-LD on the home page. */
export const SITE_FAQS: FaqItem[] = [
  {
    question: '¿Qué necesito para pedir una impresión?',
    answer:
      'Idealmente un archivo 3D (STL o similar). Si no tenés modelo, contanos qué querés y te asesoramos: lo podés buscar en sitios de la comunidad, diseñarlo vos o pedirnos el diseño.',
  },
  {
    question: '¿Cuánto tarda?',
    answer:
      'Depende del tamaño y la complejidad. En general apuntamos a menos de 5 días hábiles. Piezas chicas con el archivo listo a veces salen el mismo día. Te confirmamos el plazo al cotizar.',
  },
  {
    question: '¿PLA o PETG: cuál elijo?',
    answer:
      'PLA es fácil, rígido y económico: ideal para prototipos y deco; no aguanta mucho el calor ni el sol. PETG es más resistente y sirve para uso diario liviano o algo de exterior. Si la pieza tiene que doblarse, mirá TPU. Si no estás seguro, mandanos el uso y te orientamos.',
  },
  {
    question: '¿Se van a ver las capas?',
    answer:
      'Sí, es normal en impresión FDM. Se puede suavizar con postprocesado (lijado, pintura, etc.), pero suma tiempo y costo. Si necesitás un acabado más fino, lo hablamos en la cotización.',
  },
  {
    question: '¿Qué precisión tienen las piezas?',
    answer:
      'Orientativamente ±0,2 mm o ±0,5 % (lo que sea mayor), salvo que acordemos otra cosa. No es precisión de laboratorio: para piezas que encajan hay que dejar holgura en el diseño.',
  },
  {
    question: '¿Mis dos piezas van a encajar solas?',
    answer:
      'No siempre, si el modelo no deja espacio. Regla práctica: holgado ~0,3–0,5 mm por lado; a presión ~0,1–0,2 mm. Si dudás, diseñá un poco más holgado: es más fácil ajustar después.',
  },
  {
    question: '¿De qué depende el precio?',
    answer:
      'Principalmente del tiempo de impresión y del material (cantidad y tipo). También puede sumar diseño, soportes complejos y postprocesado. Una pieza chica pero densa a veces sale más cara que una grande y simple. Pedí presupuesto con el archivo para un número concreto.',
  },
  {
    question: '¿Puedo mandar un G-code ya laminado?',
    answer:
      'Podés enviarlo, pero igual revisamos los parámetros con vos. Usamos perfiles propios para cuidar la calidad y las máquinas.',
  },
  {
    question: '¿Hacen piezas flexibles o resistentes al calor?',
    answer:
      'Para piezas flexibles suele ir TPU. Para calor o exterior, PLA no es la mejor opción; PETG aguanta mejor, y para casos especiales consultamos otras opciones. Contanos dónde y cómo se usa la pieza.',
  },
  {
    question: '¿Qué pasa si no tengo el diseño listo?',
    answer:
      'Igual podés cotizar: describí la pieza, mandá fotos o un croquis, y vemos si conviene buscar un modelo, adaptar uno o diseñarlo desde cero.',
  },
];
