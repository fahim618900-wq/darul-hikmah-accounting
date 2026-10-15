-- MadrasahERP financial reconciliation migration
-- Makes the legacy transactions_all view include fee collections as income.
-- Safe to run more than once: CREATE OR REPLACE VIEW is idempotent for this definition.

CREATE OR REPLACE VIEW public.transactions_all AS
SELECT
  'income'::text AS type,
  i.id,
  i.entry_date AS date,
  ic.name AS category,
  i.amount,
  i.receipt_no AS ref_no,
  i.description,
  i.payment_method,
  i.created_by,
  i.created_at
FROM public.incomes AS i
LEFT JOIN public.income_categories AS ic ON ic.id = i.category_id
WHERE i.is_deleted = false OR i.is_deleted IS NULL

UNION ALL

SELECT
  'income'::text AS type,
  fp.id,
  fp.payment_date AS date,
  'শিক্ষার্থীদের বেতন/ফি'::text AS category,
  fp.amount,
  fp.receipt_no AS ref_no,
  COALESCE(
    NULLIF(fp.note, ''),
    CASE
      WHEN s.name IS NOT NULL THEN 'শিক্ষার্থী: ' || s.name
      ELSE 'শিক্ষার্থীর ফি আদায়'
    END
  ) AS description,
  fp.payment_method,
  fp.created_by,
  fp.created_at
FROM public.fee_payments AS fp
LEFT JOIN public.students AS s ON s.id = fp.student_id
WHERE fp.is_deleted = false OR fp.is_deleted IS NULL

UNION ALL

SELECT
  'expense'::text AS type,
  e.id,
  e.entry_date AS date,
  ec.name AS category,
  e.amount,
  e.voucher_no AS ref_no,
  e.description,
  e.payment_method,
  e.created_by,
  e.created_at
FROM public.expenses AS e
LEFT JOIN public.expense_categories AS ec ON ec.id = e.category_id
WHERE e.is_deleted = false OR e.is_deleted IS NULL;
