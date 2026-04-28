'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userRegisterSchema, type UserRegisterInput } from '@/lib/validators/user-register.schema';
import { Button, Input } from '@/components/ui';
import { useState } from 'react';
import { registerAction } from '@/app/auth/actions';
import { useToastStore } from '@/stores/toast.store';
import { formatCPF, formatCEP, formatPhone } from '@/lib/utils/formatters';
import { Mail, Lock, Phone, CreditCard, MapPin, Hash, Building, Map as MapIcon, User, Globe, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './RegisterForm.module.css';

type StepFields = keyof UserRegisterInput | `address.${string}`;

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore((state) => state.addToast);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<UserRegisterInput>({
    resolver: zodResolver(userRegisterSchema),
    mode: 'onBlur',
    defaultValues: {
      address: {
        label: 'Principal',
      }
    }
  });

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCEP(e.target.value);
    setValue('address.cep', value, { shouldValidate: true });

    if (value.length === 9) {
      const cleanCEP = value.replace('-', '');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue('address.street', data.logradouro, { shouldValidate: true });
          setValue('address.neighborhood', data.bairro, { shouldValidate: true });
          setValue('address.city', data.localidade, { shouldValidate: true });
          setValue('address.state', data.uf, { shouldValidate: true });
        }
      } catch (err) {
        console.error('ViaCEP error:', err);
      }
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword'];
    if (step === 2) fieldsToValidate = ['cpf', 'phone'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: UserRegisterInput) => {
    setLoading(true);
    try {
      const result = await registerAction(data);
      if (result.success) {
        toast({
          title: 'Cadastro realizado!',
          message: 'Verifique seu e-mail para confirmar a conta.',
          type: 'success'
        });
        router.push('/confirmar-email');
      } else {
        toast({
          title: 'Erro no cadastro',
          message: result.error || 'Verifique os dados e tente novamente.',
          type: 'error'
        });
      }
    } catch (err) {
      toast({
        title: 'Erro inesperado',
        message: 'Não foi possível completar o cadastro.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        <div className={`${styles.stepIndicator} ${step >= 1 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>{step > 1 ? <Check size={18} /> : 1}</div>
          <span className={styles.stepLabel}>Conta</span>
        </div>
        
        <div className={`${styles.stepLine} ${step >= 2 ? styles.activeStepLine : ''}`} />
        
        <div className={`${styles.stepIndicator} ${step >= 2 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>{step > 2 ? <Check size={18} /> : 2}</div>
          <span className={styles.stepLabel}>Pessoal</span>
        </div>
        
        <div className={`${styles.stepLine} ${step >= 3 ? styles.activeStepLine : ''}`} />
        
        <div className={`${styles.stepIndicator} ${step >= 3 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>3</div>
          <span className={styles.stepLabel}>Endereço</span>
        </div>
      </div>


      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Dados da Conta</h3>
              <p>Comece criando suas credenciais de acesso.</p>
            </div>
            <div className={styles.grid}>
              <Input
                label="Nome Completo"
                placeholder="Ex: João Silva"
                icon={<User size={18} />}
                errorMessage={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="joao@exemplo.com"
                icon={<Mail size={18} />}
                errorMessage={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                errorMessage={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                errorMessage={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>
            <div className={styles.actions}>
              <Button type="button" onClick={nextStep} className={styles.nextBtn}>
                Próximo Passo <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
              <p>Precisamos desses dados para processar seus envios fiscais.</p>
            </div>
            <div className={styles.grid}>
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                icon={<CreditCard size={18} />}
                errorMessage={errors.cpf?.message}
                {...register('cpf', {
                  onChange: (e) => (e.target.value = formatCPF(e.target.value)),
                })}
              />
              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                icon={<Phone size={18} />}
                errorMessage={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => (e.target.value = formatPhone(e.target.value)),
                })}
              />
            </div>
            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={prevStep}>
                <ChevronLeft size={18} /> Voltar
              </Button>
              <Button type="button" onClick={nextStep} className={styles.nextBtn}>
                Próximo Passo <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Endereço (Opcional)</h3>
              <p>Você pode pular esta etapa agora e preencher depois.</p>
            </div>
            <div className={styles.grid}>
              <Input
                label="CEP"
                placeholder="00000-000"
                icon={<MapPin size={18} />}
                errorMessage={errors.address?.cep?.message}
                {...register('address.cep', {
                  onChange: handleCEPChange,
                })}
              />
              <Input
                label="Rua"
                placeholder="Nome da rua"
                icon={<MapIcon size={18} />}
                errorMessage={errors.address?.street?.message}
                {...register('address.street')}
              />
              <Input
                label="Número"
                placeholder="123"
                icon={<Hash size={18} />}
                errorMessage={errors.address?.number?.message}
                {...register('address.number')}
              />
              <Input
                label="Complemento"
                placeholder="Apto, Bloco, etc (opcional)"
                errorMessage={errors.address?.complement?.message}
                {...register('address.complement')}
              />
              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                icon={<Building size={18} />}
                errorMessage={errors.address?.neighborhood?.message}
                {...register('address.neighborhood')}
              />
              <Input
                label="Cidade"
                placeholder="Sua cidade"
                icon={<Globe size={18} />}
                errorMessage={errors.address?.city?.message}
                {...register('address.city')}
              />
              <Input
                label="Estado (UF)"
                placeholder="SP"
                maxLength={2}
                errorMessage={errors.address?.state?.message}
                {...register('address.state')}
              />
            </div>
            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={prevStep}>
                <ChevronLeft size={18} /> Voltar
              </Button>
              <Button type="submit" loading={loading} className={styles.submitBtn}>
                Finalizar Cadastro
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
