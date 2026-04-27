import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar Admin de teste
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nipponbox.com.br' },
    update: {},
    create: {
      id: 'd3f4dca9-4e20-4cdc-b413-dc5403bc32fe', // ID fixo para teste
      email: 'admin@nipponbox.com.br',
      fullName: 'Administrador NipponBox',
      cpf: '00000000000',
      role: Role.ADMIN,
      emailConfirmed: true,
    },
  });

  // Criar Cliente de teste
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      id: 'a9d7c0f2-2773-4e1d-8d38-567038a5eed9',
      email: 'cliente@exemplo.com',
      fullName: 'Lucas Cliente Teste',
      cpf: '11111111111',
      role: Role.CUSTOMER,
      emailConfirmed: true,
      addresses: {
        create: {
          label: 'Casa',
          cep: '01001000',
          street: 'Praça da Sé',
          number: '123',
          neighborhood: 'Sé',
          city: 'São Paulo',
          state: 'SP',
          isDefault: true,
        },
      },
    },
  });

  console.log({ admin, customer });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
