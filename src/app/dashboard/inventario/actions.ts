"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export type InventoryFormState = { error?: string };

export async function createInventoryItem(
  _prevState: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const { clinicId } = await requireTenant();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const unit = String(formData.get("unit") ?? "unidad").trim() || "unidad";
  const warehouse = String(formData.get("warehouse") ?? "").trim() || null;
  const initialStockRaw = String(formData.get("initialStock") ?? "0");
  const reorderLevelRaw = String(formData.get("reorderLevel") ?? "0");

  if (!name) {
    return { error: "El nombre es obligatorio" };
  }

  const initialStock = Math.max(0, Math.floor(Number(initialStockRaw) || 0));
  const reorderLevel = Math.max(0, Math.floor(Number(reorderLevelRaw) || 0));

  await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.create({
      data: { clinicId, name, category, unit, warehouse, reorderLevel, stock: initialStock },
    });

    if (initialStock > 0) {
      await tx.inventoryMovement.create({
        data: {
          itemId: item.id,
          type: "in",
          quantity: initialStock,
          reason: "Stock inicial",
        },
      });
    }
  });

  revalidatePath("/dashboard/inventario");
  return {};
}

export async function registerMovement(
  _prevState: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const { clinicId } = await requireTenant();

  const itemId = String(formData.get("itemId") ?? "");
  const type = String(formData.get("type") ?? "") as "in" | "out";
  const quantityRaw = String(formData.get("quantity") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!itemId || (type !== "in" && type !== "out") || !quantityRaw) {
    return { error: "Completa todos los campos" };
  }

  const quantity = Math.floor(Number(quantityRaw));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "La cantidad debe ser mayor a 0" };
  }

  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, clinicId } });
  if (!item) {
    return { error: "Insumo no encontrado" };
  }

  if (type === "out" && quantity > item.stock) {
    return { error: `Stock insuficiente (disponible: ${item.stock})` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventoryMovement.create({
      data: { itemId, type, quantity, reason },
    });
    await tx.inventoryItem.update({
      where: { id: itemId },
      data:
        type === "in"
          ? { stock: { increment: quantity } }
          : { stock: { decrement: quantity } },
    });
  });

  revalidatePath("/dashboard/inventario");
  revalidatePath(`/dashboard/inventario/${itemId}`);
  redirect(`/dashboard/inventario/${itemId}`);
}
