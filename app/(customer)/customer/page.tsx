import { requireCustomerPortalContext } from '@/lib/auth/customer-portal';
import { fetchCustomerPortalOrders } from '@/lib/data/customer-portal-data';
import { fetchCustomerCourses } from '@/lib/data/customer-course-data';
import { lusitana } from '@/app/fonts';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import OrderStatusField from '@/app/(admin)/admin/orders/_components/status-field';
import { CourseRegistrationStatusBadges } from './courses/_components/course-status-badges';
import type { OrderStatus } from '@/types/order-definitions';
import { GraduationCap, Package, Search } from 'lucide-react';

function greetingFirstName(sessionName: string, fallback: string) {
  const firstName = sessionName.trim().split(/\s+/)[0];
  return firstName || fallback;
}

export default async function CustomerHomePage() {
  const { customer, userId, name } = await requireCustomerPortalContext();
  const [orders, courses] = await Promise.all([
    fetchCustomerPortalOrders(customer.id),
    fetchCustomerCourses(userId),
  ]);

  const recentOrders = orders.slice(0, 3);
  const recentCourses = courses.slice(0, 3);
  const displayName = greetingFirstName(
    name,
    customer.type === 'person' ? customer.first_name || customer.name : customer.name
  );
  const showShortcuts = orders.length === 0 && courses.length === 0;

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`${lusitana.className} text-2xl md:text-3xl`}>
            Hola, {displayName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acá ves tus pedidos y cursos.
          </p>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/quote-request">Solicitar presupuesto</Link>
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="home-orders-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="home-orders-heading" className="text-lg font-semibold">
              Mis pedidos
            </h2>
            {orders.length > 0 && (
              <Link
                href="/customer/orders"
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Todavía no tenés pedidos. Pedí un presupuesto y vas a verlos acá.
              </p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/quote-request">Solicitar presupuesto</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/customer/orders/${order.id}`}
                    className="flex flex-col gap-2 rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{order.tracking_code}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                    <OrderStatusField statusName={order.status as OrderStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="home-courses-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="home-courses-heading" className="text-lg font-semibold">
              Mis cursos
            </h2>
            {courses.length > 0 && (
              <Link
                href="/customer/courses"
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </Link>
            )}
          </div>

          {recentCourses.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Cuando te inscribas a un curso, aparece acá con el acceso al aula.
              </p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/education">Ver cursos</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentCourses.map((course) => (
                <li key={course.registrationId}>
                  <Link
                    href={`/customer/courses/${course.slug}`}
                    className="block rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-3">
                      <p className="font-medium">{course.title}</p>
                      <CourseRegistrationStatusBadges
                        registrationStatus={course.registrationStatus}
                        paymentStatus={course.paymentStatus}
                        price={course.price}
                      />
                      {course.canAccessClassroom && (
                        <span className="text-sm text-primary">Ir al aula →</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {showShortcuts && (
        <nav
          aria-label="Accesos rápidos"
          className="mt-10 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:flex-wrap sm:gap-6"
        >
          <Link
            href="/quote-request"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Package className="size-4 shrink-0" aria-hidden="true" />
            Solicitar presupuesto
          </Link>
          <Link
            href="/print-status"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            Seguir un pedido
          </Link>
          <Link
            href="/education"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
            Ver cursos
          </Link>
        </nav>
      )}
    </div>
  );
}
