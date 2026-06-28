import emailjs from '@emailjs/browser';
import { formatRupiah } from '@/utils/formatRupiah';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const INVOICE_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_INVOICE;
const LICENSE_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_LICENSE;
const REJECTION_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_REJECTION;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

emailjs.init(PUBLIC_KEY);

/* =========================
   INVOICE (Order Pending)
========================= */
export const sendInvoiceEmail = async (data: {
  to_email: string;
  to_name: string;
  order_id: string;
  invoice_number: string;
  order_date: string;
  product_name: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  saldo_used: number;
  total: number;
}) => {
  return emailjs.send(SERVICE_ID, INVOICE_TEMPLATE, {
    to_email: data.to_email,
    to_name: data.to_name,

    from_name: 'Clover Store',
    reply_to: 'fahrixzstore@gmail.com',

    order_id: data.order_id,
    invoice_number: data.invoice_number,
    order_date: data.order_date,

    product_name: data.product_name,

    payment_method: data.payment_method,
    payment_status: data.payment_status,

    subtotal: formatRupiah(data.subtotal),
    saldo_used: formatRupiah(data.saldo_used),
    total: formatRupiah(data.total),

    company_name: 'Clover Store',
    company_address: 'Tanggamus, Lampung',

    support_email: 'fahrixzstore@gmail.com',
    support_phone: '+62 856-0994-9819',
  });
};

/* =========================
   LICENSE (Payment Success)
========================= */
export const sendLicenseEmail = async (data: {
  to_email: string;
  to_name: string;
  order_id: string;
  product_name: string;
  license_key: string;
  download_link: string;
}) => {
  return emailjs.send(SERVICE_ID, LICENSE_TEMPLATE, {
    to_email: data.to_email,
    to_name: data.to_name,

    from_name: 'Clover Store',
    reply_to: 'supportcloverstore@gmail.com',

    order_id: data.order_id,
    product_name: data.product_name,

    license_key: data.license_key,
    download_link: data.download_link,

    company_name: 'Clover Store',
    support_email: 'supportcloverstore@gmail.com',
    support_phone: '+62 856-0994-9819',
  });
};

/* =========================
   PAYMENT REJECTED
========================= */
export const sendRejectionEmail = async (data: {
  to_email: string;
  to_name: string;
  order_id: string;
  alasan: string;
}) => {
  return emailjs.send(SERVICE_ID, REJECTION_TEMPLATE, {
    to_email: data.to_email,
    to_name: data.to_name,

    from_name: 'Clover Store',
    reply_to: 'fahrixzstore@gmail.com',

    order_id: data.order_id,
    alasan: data.alasan,

    company_name: 'Clover Store',
    support_email: 'supportcloverstore@gmail.com',
    support_phone: '+62 856-0994-9819',
  });
};