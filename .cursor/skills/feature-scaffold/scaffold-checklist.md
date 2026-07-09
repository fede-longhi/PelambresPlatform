# Feature scaffold checklist

Copy into the reply or tick off while implementing.

## Planning

- [ ] Domain name and table(s) defined
- [ ] Surfaces: admin / public / customer
- [ ] Similar existing domain identified as reference
- [ ] Migration needed? → **db-migration** skill

## Backend

- [ ] `types/{domain}-definitions.ts` or entries in `types/definitions.ts`
- [ ] `lib/consts/{domain}-consts.ts` (if enums/labels)
- [ ] `lib/data/{domain}-data.ts` — fetch helpers only
- [ ] `lib/actions/{domain}-actions.ts` — mutations + `*FormState`
- [ ] Admin actions guarded with `canAccessAdmin` / `requireAdminSessionUserId`

## Routes & UI

- [ ] `app/(admin)/admin/{domain}/page.tsx` — list
- [ ] `app/(admin)/admin/{domain}/_components/*-table.tsx`
- [ ] Create + edit pages and forms
- [ ] `useActionState` wired to server actions
- [ ] Loading skeletons + empty states
- [ ] Responsive layout (`responsive-ui.mdc`)

## Finish

- [ ] `revalidatePath` on all mutation success paths
- [ ] Spanish validation messages
- [ ] **auth-review** on new routes/actions (if auth-sensitive)
- [ ] **qa-manager** test cases suggested
- [ ] **ui-design** review for public/customer UI (if applicable)

## Deliverable summary

Tell the user:

1. Files created/modified
2. Routes to test manually
3. Optional QA file to generate next
