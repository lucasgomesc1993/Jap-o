'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { userRegisterSchema } from '@/lib/validators/user-register.schema';

import { loginSchema } from '@/lib/validators/login.schema';

import { sendEmail } from '@/lib/email/service';
import WelcomeEmail from '@/lib/email/templates/WelcomeEmail';
import { redirect } from 'next/navigation';

export async function registerAction(formData: any) {
  const validatedFields = userRegisterSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { 
      error: 'Dados inválidos.', 
      details: validatedFields.error.flatten().fieldErrors 
    };
  }

  const { email, password, fullName, cpf, phone, address } = validatedFields.data;
  const supabase = await createClient();

  // 1. Supabase Auth Signup
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Erro ao criar conta no serviço de autenticação.' };
  }

  const userId = authData.user.id;

  try {
    // 2. Prisma Database Creation (Transaction)
    await prisma.$transaction(async (tx) => {
      const userData: any = {
        id: userId,
        email,
        fullName,
        cpf: cpf.replace(/\D/g, ''),
        phone: phone.replace(/\D/g, ''),
        wallet: {
          create: {
            balance: 0,
          },
        },
      };

      // Só cria o endereço se o CEP for fornecido
      if (address && address.cep) {
        userData.addresses = {
          create: {
            label: address.label || 'Principal',
            cep: address.cep.replace(/\D/g, ''),
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            isDefault: true,
          },
        };
      }

      await tx.user.create({
        data: userData,
      });
    });


    // 3. Enviar E-mail de Boas-vindas (Background/Fire-and-forget)
    const firstName = fullName.split(' ')[0];
    sendEmail({
      to: email,
      subject: 'Bem-vindo à NipponBox!',
      react: WelcomeEmail({ userFirstname: firstName }),
    }).catch(err => console.error('Failed to send welcome email:', err));

    return { success: true };
  } catch (dbError: any) {
    console.error('Database registration error:', dbError);
    
    // Se falhar o banco, idealmente deveríamos remover do Auth, 
    // mas o Supabase não permite deletar users facilmente via client anon.
    // O ideal é que o usuário tente novamente e o upsert trate, 
    // mas aqui o ID do auth já existe.
    
    if (dbError.code === 'P2002') {
       return { error: 'CPF ou E-mail já cadastrado no nosso banco de dados.' };
    }
    return { error: 'Conta criada na autenticação, mas houve erro ao salvar dados complementares. Entre em contato com o suporte.' };
  }
}

export async function loginAction(formData: any) {
  const validatedFields = loginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: 'E-mail ou senha inválidos.' };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

