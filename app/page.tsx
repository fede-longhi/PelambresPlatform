import HomeBanner from './ui/home/home-banner';
import ContactBanner from './ui/home/contact-banner';
import OurServicesBanner from './ui/home/our-services';
import HomeNavigationMenu from './ui/home-navigation-menu';

export default function Page() {
    return (
        <main className="flex min-h-screen flex-col w-full">
            <HomeNavigationMenu />
            <HomeBanner />
            <OurServicesBanner />
            <ContactBanner />
        </main>
    );
}
