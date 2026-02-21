import prisma from '../src/config/database';

beforeAll(async () => {
  // Setup antes de todos os testes
  console.log('🧪 Iniciando testes...');
});

afterAll(async () => {
  // Cleanup após todos os testes
  await prisma.$disconnect();
  console.log('✅ Testes finalizados');
});
