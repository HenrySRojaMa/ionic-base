// Verifica que el build de producción NO contenga el backend simulado.
// Uso: npm run build:check  (hace ng build y luego ejecuta este script).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist/ionic-base/browser';
// Textos que solo existen en core/mock: si aparecen, el mock se coló al bundle.
const markers = ['mock.refresh-user', 'Ruta simulada no encontrada'];

const files = readdirSync(dir).filter((file) => file.endsWith('.js'));
const leaks = files.flatMap((file) => {
  const code = readFileSync(join(dir, file), 'utf8');
  return markers.filter((marker) => code.includes(marker)).map((marker) => `${file}: ${marker}`);
});

// El entorno de producción debe tener el mock apagado (las pruebas unitarias no lo
// ven: se compilan con el entorno de desarrollo).
const productionEnv = readFileSync('src/environments/environment.ts', 'utf8');
if (!/mockApi:\s*false/.test(productionEnv)) leaks.push('environment.ts: mockApi no es false');

if (leaks.length) {
  console.error('El build de producción incluye el backend simulado:\n' + leaks.join('\n'));
  process.exit(1);
}
console.log(`OK: ${files.length} archivos JS sin rastros del backend simulado.`);
