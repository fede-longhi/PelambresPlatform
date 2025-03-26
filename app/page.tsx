import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HomeBanner from './ui/home/home-banner';
import ContactBanner from './ui/home/contact-banner';
import OurServicesBanner from './ui/home/our-services';

export default function Page() {
    const isProduction = process.env.IS_PRODUCTION === 'true';
    return (
        <main className="flex min-h-screen flex-col">
            <div className="flex flex-col bg-primary">
                {
                    !isProduction &&
                    <div className="flex flex-row-reverse">
                        <Link
                        href="/login"
                        className="flex flex-row text-white mx-8 mt-4" 
                        >
                            <span>Login</span>
                            <ArrowRightIcon className="w-5 md:w-6 ml-2" />
                        </Link>
                    </div>

                }

                <HomeBanner />
            </div>

            {/* <PrintGuideBanner /> */}
            <OurServicesBanner />
            <ContactBanner />

        </main>
    );
}
