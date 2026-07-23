import {
  checkoutResultMetadata,
  createCheckoutResultPage,
} from '../_components/checkout-result';

export const metadata = checkoutResultMetadata.failure;
export default createCheckoutResultPage('failure');
