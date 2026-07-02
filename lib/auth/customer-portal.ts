import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { canAccessCustomer } from '@/lib/auth/permissions';
import {
  fetchLinkedCustomerForUser,
  type CustomerPortalOrder,
} from '@/lib/data/customer-portal-data';
import type { CustomerCourseDetail } from '@/lib/data/customer-course-data';
import type { Customer } from '@/types/definitions';

export type CustomerPortalContext = {
  userId: string;
  email: string;
  name: string;
  customer: Customer;
};

export async function requireCustomerPortalContext(): Promise<CustomerPortalContext> {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    !sessionUser.email ||
    !canAccessCustomer({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name ?? '',
      role: sessionUser.role,
      isActive: sessionUser.isActive,
      mustChangePassword: sessionUser.mustChangePassword,
    })
  ) {
    redirect('/login?callbackUrl=/customer');
  }

  const customer = await fetchLinkedCustomerForUser(sessionUser.id, sessionUser.email);

  if (!customer) {
    redirect('/customer/unlinked');
  }

  return {
    userId: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name ?? '',
    customer,
  };
}

export async function requireCustomerPortalOrder(
  orderId: string
): Promise<{ context: CustomerPortalContext; order: CustomerPortalOrder }> {
  const context = await requireCustomerPortalContext();
  const { fetchCustomerPortalOrderById } = await import('@/lib/data/customer-portal-data');
  const order = await fetchCustomerPortalOrderById(context.customer.id, orderId);

  if (!order) {
    redirect('/customer/orders');
  }

  return { context, order };
}

export async function requireCustomerPortalCourse(
  slug: string
): Promise<{ context: CustomerPortalContext; course: CustomerCourseDetail }> {
  const context = await requireCustomerPortalContext();
  const { fetchCustomerCourseBySlug } = await import('@/lib/data/customer-course-data');
  const course = await fetchCustomerCourseBySlug(context.userId, context.email, slug);

  if (!course) {
    redirect('/customer/courses');
  }

  return { context, course };
}
