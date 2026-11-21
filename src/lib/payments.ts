import { auth } from './firebase';
import type { FreeResource, OrderRecord, PaymentMethodId, Product } from '../types/store';

export interface PaymentProviderOption {
  id: PaymentMethodId;
  name: string;
  regionSupport: string;
  description: string;
  settlementNote: string;
  testMode: true;
}

export const DEMO_PAYMENT_PROVIDERS: PaymentProviderOption[] = [
  {
    id: 'demo-card',
    name: 'Global Card Checkout (Flutterwave / DPO Adapter)',
    regionSupport: 'Visa · Mastercard · International USD',
    description: 'Simulates an international card checkout routed through a Rwanda-compatible gateway.',
    settlementNote: 'Demo Test Mode — No real card is charged.',
    testMode: true,
  },
  {
    id: 'demo-momo',
    name: 'Mobile Money Demo (MTN MoMo / Airtel Money)',
    regionSupport: 'Rwanda & East Africa · RWF equivalent shown',
    description: 'Simulates a Mobile Money prompt for local customers in Rwanda.',
    settlementNote: 'Demo Test Mode — No mobile money prompt is sent.',
    testMode: true,
  },
  {
    id: 'demo-mor',
    name: 'Merchant of Record Demo (Paddle / Lemon Squeezy)',
    regionSupport: 'Global VAT/Tax-handled digital checkout',
    description: 'Simulates global digital-product tax compliance and instant file licensing.',
    settlementNote: 'Demo Test Mode — Simulated license & order confirmation.',
    testMode: true,
  },
];

export interface DemoCheckoutInput {
  customerEmail: string;
  paymentMethod: PaymentMethodId;
  momoPhone?: string;
}

export interface DemoCheckoutResult {
  success: boolean;
  providerName: string;
  error?: string;
}

export async function processDemoPayment(
  input: DemoCheckoutInput
): Promise<DemoCheckoutResult> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  if (!input.customerEmail.includes('@')) {
    return {
      success: false,
      providerName: '',
      error: 'Please enter a valid customer email address for digital delivery.',
    };
  }

  if (
    input.paymentMethod === 'demo-momo' &&
    (!input.momoPhone || input.momoPhone.trim().length < 8)
  ) {
    return {
      success: false,
      providerName: '',
      error: 'Enter a valid demo mobile number (e.g. 0780 000 000) to simulate Mobile Money.',
    };
  }

  const provider =
    DEMO_PAYMENT_PROVIDERS.find((p) => p.id === input.paymentMethod) ??
    DEMO_PAYMENT_PROVIDERS[0];

  return {
    success: true,
    providerName: provider.name,
  };
}

/**
 * Fetches and downloads the real uploaded PDF or starter package from the backend
 * gated endpoint `/api/downloads/:orderId/:productId`.
 */
export async function downloadVerifiedProductPackage(
  product: Product,
  order: OrderRecord
): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (auth.currentUser) {
    const idToken = await auth.currentUser.getIdToken();
    headers.Authorization = `Bearer ${idToken}`;
  }

  const query = order.receiptToken
    ? `?receipt=${encodeURIComponent(order.receiptToken)}`
    : '';
  const res = await fetch(
    `/api/downloads/${encodeURIComponent(order.id)}/${encodeURIComponent(product.id)}${query}`,
    { headers }
  );

  if (!res.ok) {
    return false;
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename =
    match?.[1] ||
    product.deliverableFileName ||
    `${product.slug}-craftedlabs-package.md`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function downloadFreeResourceFile(resource: FreeResource) {
  const blob = new Blob([resource.fileContent], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = resource.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
