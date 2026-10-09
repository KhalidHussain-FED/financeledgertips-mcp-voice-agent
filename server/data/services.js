/**
 * Finance Ledger Tips — Service Catalog
 */

export const SERVICES = [
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    icon: '📚',
    tagline: 'Clean books, zero stress',
    description:
      'Daily transaction categorization, reconciliations, invoicing, and monthly bookkeeping — organized and audit-ready.',
    bullets: [
      'Transaction categorization',
      'Bank & credit card reconciliations',
      'Invoicing and receipt capture',
      'Monthly close package',
    ],
    keywords: ['bookkeeping', 'books', 'invoicing', 'receipts', 'quickbooks', 'xero'],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: '📊',
    tagline: 'Insight-driven financials',
    description:
      'General ledger, monthly close, financial statement preparation, and cash-flow reporting.',
    bullets: [
      'General ledger management',
      'Monthly close & review',
      'Financial statement preparation',
      'Cash-flow reporting',
    ],
    keywords: ['accounting', 'ledger', 'financial statements', 'close', 'gaap'],
  },
  {
    id: 'taxes',
    name: 'Taxes',
    icon: '🧾',
    tagline: 'File smart, save more',
    description:
      'Federal and state tax preparation, planning, and filing for individuals and businesses.',
    bullets: [
      'Federal & state filing',
      'Individual and business returns',
      'Tax planning & strategy',
      'Deduction optimization',
    ],
    keywords: ['tax', 'taxes', 'irs', 'filing', 'return', 'deduction', '1099', 'w-2'],
  },
  {
    id: 'payroll',
    name: 'Payroll',
    icon: '💵',
    tagline: 'Pay your team on time',
    description:
      'End-to-end payroll processing, direct deposit, tax withholding, and compliance filings.',
    bullets: [
      'Full payroll processing',
      'Direct deposit',
      'Tax withholding & filings',
      'W-2 / 1099 preparation',
    ],
    keywords: ['payroll', 'salary', 'wages', 'paycheck', 'direct deposit', 'withholding'],
  },
  {
    id: 'financialTips',
    name: 'Financial Tips',
    icon: '💡',
    tagline: 'Grow your money wisdom',
    description:
      'Practical guides, budgeting tips, and wealth-building strategies for individuals and small businesses.',
    bullets: [
      'Budgeting frameworks',
      'Saving strategies',
      'Credit score guidance',
      'Small-business money tips',
    ],
    keywords: ['tips', 'advice', 'budget', 'saving', 'invest', 'wealth', 'credit score', 'debt'],
  },
];

export const SERVICE_MAP = new Map(SERVICES.map((s) => [s.id, s]));
export const SERVICE_BY_ID = Object.fromEntries(SERVICE_MAP);
export const getService = (id) => SERVICE_MAP.get(id);
export const SERVICE_IDS = SERVICES.map((s) => s.id);
