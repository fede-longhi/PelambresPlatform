import { Badge } from '@/components/ui/badge';
import { REGISTRATION_STATUSES, PAYMENT_STATUSES } from '@/lib/consts/registration-consts';
import { canAccessCourseClassroom } from '@/lib/auth/course-access';

function getRegistrationLabel(status: string) {
  return REGISTRATION_STATUSES.find((item) => item.value === status)?.label ?? status;
}

function getPaymentLabel(status: string) {
  return PAYMENT_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function CourseRegistrationStatusBadges({
  registrationStatus,
  paymentStatus,
  price,
}: {
  registrationStatus: string;
  paymentStatus: string;
  price: number;
}) {
  const hasClassroomAccess = canAccessCourseClassroom(
    { registrationStatus, paymentStatus },
    price
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={registrationStatus === 'confirmed' ? 'default' : 'secondary'}>
        {getRegistrationLabel(registrationStatus)}
      </Badge>
      {Number(price) > 0 && (
        <Badge variant={paymentStatus === 'paid' ? 'default' : 'outline'}>
          Pago: {getPaymentLabel(paymentStatus)}
        </Badge>
      )}
      {hasClassroomAccess ? (
        <Badge className="bg-green-600 hover:bg-green-600">Aula disponible</Badge>
      ) : (
        <Badge variant="outline">Aula bloqueada</Badge>
      )}
    </div>
  );
}
