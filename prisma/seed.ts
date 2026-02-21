import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@azulstreet.com.br' },
    update: {},
    create: {
      email: 'admin@azulstreet.com.br',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuário admin criado:', admin.email);

  // Criar usuário cliente de teste
  const clientPassword = await bcrypt.hash('cliente123', 12);
  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      email: 'cliente@teste.com',
      password: clientPassword,
      name: 'Cliente Teste',
      role: 'CUSTOMER',
      phone: '11999999999',
    },
  });
  console.log('✅ Usuário cliente criado:', cliente.email);

  // Criar endereço para o cliente
  await prisma.address.upsert({
    where: { id: 'addr-teste-1' },
    update: {},
    create: {
      id: 'addr-teste-1',
      userId: cliente.id,
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isMain: true,
    },
  });
  console.log('✅ Endereço criado para cliente');

  // Criar categorias
  const categorias = [
    { name: 'Camisetas', slug: 'camisetas', imageUrl: '/uploads/cat-camisetas.jpg' },
    { name: 'Calças', slug: 'calcas', imageUrl: '/uploads/cat-calcas.jpg' },
    { name: 'Vestidos', slug: 'vestidos', imageUrl: '/uploads/cat-vestidos.jpg' },
    { name: 'Acessórios', slug: 'acessorios', imageUrl: '/uploads/cat-acessorios.jpg' },
    { name: 'Calçados', slug: 'calcados', imageUrl: '/uploads/cat-calcados.jpg' },
  ];

  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categorias criadas:', categorias.length);

  // Buscar categoria de camisetas
  const catCamisetas = await prisma.category.findUnique({ where: { slug: 'camisetas' } });
  const catCalcas = await prisma.category.findUnique({ where: { slug: 'calcas' } });
  const catVestidos = await prisma.category.findUnique({ where: { slug: 'vestidos' } });
  const catAcessorios = await prisma.category.findUnique({ where: { slug: 'acessorios' } });

  // Criar produtos
  const produtos = [
    {
      name: 'Camiseta Básica Azul',
      slug: 'camiseta-basica-azul',
      description: 'Camiseta básica 100% algodão na cor azul. Confortável e versátil para o dia a dia.',
      price: 79.90,
      oldPrice: 99.90,
      stock: 50,
      sku: 'CAM-BAS-AZL-001',
      categoryId: catCamisetas!.id,
      images: ['/uploads/camiseta-azul-1.jpg', '/uploads/camiseta-azul-2.jpg'],
    },
    {
      name: 'Camiseta Estampada Street',
      slug: 'camiseta-estampada-street',
      description: 'Camiseta com estampa exclusiva AZUL STREET. Design urbano e moderno.',
      price: 119.90,
      stock: 30,
      sku: 'CAM-EST-STR-001',
      categoryId: catCamisetas!.id,
      images: ['/uploads/camiseta-street-1.jpg'],
    },
    {
      name: 'Calça Jeans Slim',
      slug: 'calca-jeans-slim',
      description: 'Calça jeans slim fit com elastano. Conforto e estilo em uma peça só.',
      price: 189.90,
      oldPrice: 229.90,
      stock: 25,
      sku: 'CAL-JNS-SLM-001',
      categoryId: catCalcas!.id,
      images: ['/uploads/calca-jeans-1.jpg', '/uploads/calca-jeans-2.jpg'],
    },
    {
      name: 'Calça Cargo Preta',
      slug: 'calca-cargo-preta',
      description: 'Calça cargo com bolsos laterais. Estilo streetwear autêntico.',
      price: 159.90,
      stock: 40,
      sku: 'CAL-CRG-PRT-001',
      categoryId: catCalcas!.id,
      images: ['/uploads/calca-cargo-1.jpg'],
    },
    {
      name: 'Vestido Midi Floral',
      slug: 'vestido-midi-floral',
      description: 'Vestido midi com estampa floral. Perfeito para ocasiões especiais.',
      price: 249.90,
      stock: 15,
      sku: 'VES-MID-FLR-001',
      categoryId: catVestidos!.id,
      images: ['/uploads/vestido-floral-1.jpg'],
    },
    {
      name: 'Boné AZUL STREET',
      slug: 'bone-azul-street',
      description: 'Boné com logo bordado AZUL STREET. Ajuste snapback.',
      price: 89.90,
      stock: 100,
      sku: 'ACE-BON-AZL-001',
      categoryId: catAcessorios!.id,
      images: ['/uploads/bone-azul-1.jpg'],
    },
    {
      name: 'Mochila Urban',
      slug: 'mochila-urban',
      description: 'Mochila resistente com compartimento para notebook. Ideal para o dia a dia.',
      price: 199.90,
      oldPrice: 249.90,
      stock: 20,
      sku: 'ACE-MOC-URB-001',
      categoryId: catAcessorios!.id,
      images: ['/uploads/mochila-urban-1.jpg'],
    },
  ];

  for (const prod of produtos) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }
  console.log('✅ Produtos criados:', produtos.length);

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📧 Credenciais de acesso:');
  console.log('   Admin: admin@azulstreet.com.br / admin123');
  console.log('   Cliente: cliente@teste.com / cliente123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
