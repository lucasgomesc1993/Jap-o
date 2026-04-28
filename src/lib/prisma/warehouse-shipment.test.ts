import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from './client';
import { 
  WarehouseItemStatus, 
  ExtraServiceType, 
  ExtraServiceStatus, 
  ShippingMethod, 
  ShipmentStatus, 
  DeclaredValueType 
} from '@prisma/client';

describe('Warehouse and Shipment Integration', () => {
  let userId: string;
  let orderId: string;
  let addressId: string;

  beforeAll(async () => {
    // Setup test user, address and order
    const user = await prisma.user.create({
      data: {
        email: `warehouse-test-${Date.now()}@nipponbox.com.br`,
        fullName: 'Warehouse Tester',
        cpf: `cpf-w-${Date.now()}`,
        addresses: {
          create: {
            cep: '01001000',
            street: 'Rua do Armazém',
            number: '100',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
          }
        },
        orders: {
          create: {
            productUrl: 'https://test.jp/item',
            productName: 'Item para Armazém',
            priceJpy: 5000,
            priceBrl: 200,
            serviceFee: 20,
            fixedFee: 20,
            totalBrl: 240,
          }
        }
      },
      include: {
        addresses: true,
        orders: true
      }
    });

    userId = user.id;
    orderId = user.orders[0].id;
    addressId = user.addresses[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
  });

  it('deve criar um WarehouseItem vinculado a um pedido', async () => {
    const item = await prisma.warehouseItem.create({
      data: {
        userId,
        orderId,
        name: 'Item Recebido',
        weightGrams: 500,
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
        status: WarehouseItemStatus.AVAILABLE,
      }
    });

    expect(item.id).toBeDefined();
    expect(item.orderId).toBe(orderId);
    expect(item.status).toBe(WarehouseItemStatus.AVAILABLE);
    expect(item.weightGrams).toBe(500);
  });

  it('deve permitir criar um WarehouseItem sem pedido (ex: recebimento avulso)', async () => {
    const item = await prisma.warehouseItem.create({
      data: {
        userId,
        name: 'Presente Avulso',
        weightGrams: 200,
        status: WarehouseItemStatus.AVAILABLE,
      }
    });

    expect(item.id).toBeDefined();
    expect(item.orderId).toBeNull();
  });

  it('deve solicitar um serviço extra para um item do armazém', async () => {
    const item = await prisma.warehouseItem.findFirst({ where: { userId } });
    
    const service = await prisma.extraService.create({
      data: {
        warehouseItemId: item!.id,
        type: ExtraServiceType.EXTRA_PHOTO,
        price: 5.00,
        status: ExtraServiceStatus.REQUESTED,
      }
    });

    expect(service.id).toBeDefined();
    expect(service.type).toBe(ExtraServiceType.EXTRA_PHOTO);
    expect(service.status).toBe(ExtraServiceStatus.REQUESTED);
  });

  it('deve criar um envio (Shipment) com múltiplos itens', async () => {
    const items = await prisma.warehouseItem.findMany({ where: { userId } });
    
    const shipment = await prisma.shipment.create({
      data: {
        userId,
        addressId,
        shippingMethod: ShippingMethod.EMS,
        totalWeightGrams: 700,
        shippingCostBrl: 150.00,
        insuranceCostBrl: 15.00,
        hasInsurance: true,
        declaredValueType: DeclaredValueType.REAL,
        declaredValueBrl: 500.00,
        status: ShipmentStatus.PREPARING,
        shipmentItems: {
          create: items.map(item => ({
            warehouseItemId: item.id
          }))
        }
      },
      include: {
        shipmentItems: true
      }
    });

    expect(shipment.id).toBeDefined();
    expect(shipment.shipmentItems).toHaveLength(items.length);
    expect(shipment.shippingMethod).toBe(ShippingMethod.EMS);
    
    // Atualizar status dos itens para SELECTED_FOR_SHIPMENT
    await prisma.warehouseItem.updateMany({
      where: { id: { in: items.map(i => i.id) } },
      data: { status: WarehouseItemStatus.SELECTED_FOR_SHIPMENT }
    });

    const updatedItems = await prisma.warehouseItem.findMany({
      where: { id: { in: items.map(i => i.id) } }
    });

    updatedItems.forEach(item => {
      expect(item.status).toBe(WarehouseItemStatus.SELECTED_FOR_SHIPMENT);
    });
  });

  it('deve validar relações N:N entre Shipment e WarehouseItem', async () => {
    const shipment = await prisma.shipment.findFirst({
      where: { userId },
      include: {
        shipmentItems: {
          include: {
            warehouseItem: true
          }
        }
      }
    });

    expect(shipment?.shipmentItems[0].warehouseItem).toBeDefined();
    expect(shipment?.shipmentItems[0].warehouseItem.userId).toBe(userId);
  });
});
